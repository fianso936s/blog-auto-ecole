import {productClient} from "./product-client";
import * as DocumentPicker from "expo-document-picker";
import * as Crypto from "expo-crypto";
import { Directory, File, Paths } from "expo-file-system";
import { fetch as fileFetch } from "expo/fetch";
import { db } from "./local";
import { request } from "./auth";

export type Video = {
  id: string;
  author_id: string;
  author_name: string;
  route_id: string | null;
  route_name: string | null;
  title: string;
  state: "local" | "uploading" | "ready";
  visibility: "private" | "students";
  bytes: number;
  duration_ms: number | null;
  created_at: string;
  mime_type: "video/mp4" | "video/quicktime";
  live_status: "idle" | "live" | "ended";
  webrtc_started_at?: string | null;
};
export type VideoConfig = { uploadEnabled: boolean; maxFileBytes: number; freeStorageBudgetBytes: number; message: string };
export const fetchVideos = () => request<{ videos: Video[] }>("/v1/videos");
export const fetchVideoConfig = () => request<VideoConfig>("/v1/videos/config");
export const fetchGrants = (id: string) => request<{ students: string[] }>(`/v1/videos/${id}/grants`);
export const saveGrants = (id: string, students: string[], published: boolean) =>
  productClient.shareVideo(id,students,published);
export const playback = (id: string) => request<{ url: string; expiresIn: number }>(`/v1/videos/${id}/playback`);
export const retryVideo = (id: string) => request<{ ok: boolean }>(`/v1/videos/${id}/retry`, { method: "POST", body:"{}" });
export const removeVideo = (id: string) => request<{ ok: boolean }>(`/v1/videos/${id}`, { method: "DELETE" });

import type { SavedRecording } from "./meta-live";

type LocalFileRow = { video_id: string; owner_id: string; uri: string; size: number; mime: string };
async function localDb() {
  const d = await db();
  await d.execAsync(`CREATE TABLE IF NOT EXISTS private_video_files (
    video_id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, uri TEXT NOT NULL,
    size INTEGER NOT NULL, mime TEXT NOT NULL);`);
  return d;
}
export async function localFile(videoId: string, ownerId: string) {
  const d = await localDb();
  return d.getFirstAsync<LocalFileRow>("SELECT * FROM private_video_files WHERE video_id=? AND owner_id=?", videoId, ownerId);
}
/** Attach an already-finalized Meta recording, without duplicating gigabytes in iPhone storage. */
export async function saveCapturedVideo(videoId:string, ownerId:string, saved:SavedRecording) {
  if(!saved.uri.startsWith("file://") || !saved.uri.toLowerCase().endsWith(".mov"))
    throw new Error("Enregistrement Meta non reconnu.");
  const file=new File(saved.uri);
  if(!file.exists || file.size<=0 || file.size!==saved.bytes)
    throw new Error("Le fichier vidéo n'est pas encore finalisé sur l'iPhone.");
  const d=await localDb();
  await d.runAsync(`INSERT INTO private_video_files(video_id,owner_id,uri,size,mime)
    VALUES(?,?,?,?,?) ON CONFLICT(video_id) DO UPDATE
    SET uri=excluded.uri,size=excluded.size,mime=excluded.mime
    WHERE private_video_files.owner_id=excluded.owner_id`,
    videoId,ownerId,file.uri,file.size,"video/quicktime");
  return file.uri;
}

export async function importVideo(ownerId: string, title: string, routeId?: string | null) {
  const picker = await DocumentPicker.getDocumentAsync({
    type: ["video/mp4", "video/quicktime", "public.movie"], copyToCacheDirectory: true,
  });
  if (picker.canceled || !picker.assets[0]) return null;
  const selected = picker.assets[0];
  const mime = selected.mimeType === "video/quicktime" || /\.mov$/i.test(selected.name) ? "video/quicktime" : "video/mp4";
  if (!/\.(mp4|mov|m4v)$/i.test(selected.name)) throw new Error("Choisissez une vidéo MP4 ou MOV.");
  const input = new File(selected.uri);
  const config = await fetchVideoConfig();
  // No arbitrary local duration/file limit: large recordings may stay on the iPhone.
  // Cloud upload has a separate size quota; full-length local recording is never shortened.
  void config;
  if (input.size <= 0) throw new Error("Vidéo vide ou inaccessible.");
  // A durable iPhone copy is retained independently of the temporary Files picker URI.
  const folder = new Directory(Paths.document, "repere-private-videos");
  if (!folder.exists) folder.create({ idempotent: true });
  const destination = new File(folder, `${Crypto.randomUUID()}${mime === "video/mp4" ? ".mp4" : ".mov"}`);
  input.copy(destination);
  let videoId: string | null = null;
  try {
    const created = await request<{ id: string }>("/v1/videos", {
      method: "POST", body: JSON.stringify({ title, routeId: routeId || null }),
    });
    videoId = created.id;
    const d = await localDb();
    await d.runAsync("INSERT INTO private_video_files(video_id,owner_id,uri,size,mime) VALUES(?,?,?,?,?)",
      created.id, ownerId, destination.uri, destination.size, mime);
    return created.id;
  } catch (error) {
    if (destination.exists) destination.delete();
    if (videoId) { try { await removeVideo(videoId); } catch { /* keep remote private draft for recovery */ } }
    throw error;
  }
}
export async function uploadPrivateVideo(videoId: string, ownerId: string) {
  const entry = await localFile(videoId, ownerId);
  if (!entry) throw new Error("Vidéo locale introuvable sur cet iPhone.");
  if (entry.mime !== "video/mp4" && entry.mime !== "video/quicktime") throw new Error("Format vidéo non autorisé.");
  const file = new File(entry.uri);
  if (!file.exists || file.size !== entry.size) throw new Error("Le fichier local a changé ou n’existe plus.");
  const config=await fetchVideoConfig();
  if(file.size>config.maxFileBytes)throw new Error("Vidéo intégrale conservée sur l’iPhone. La limite actuelle de 500 Mio concerne uniquement le partage cloud : compressez la vidéo ou augmentez ce plafond avec un envoi multipart sécurisé.");
  const ticket = await request<{ uploadUrl: string; headers: Record<string,string> }>(`/v1/videos/${videoId}/upload`, {
    method: "POST",body:JSON.stringify({ bytes:file.size,mimeType:entry.mime }),
  });
  // expo/fetch supports Expo File as a streamed Blob; no full-video base64 / JS heap copy.
  const response = await fileFetch(ticket.uploadUrl, {
    method: "PUT", body: file, headers: ticket.headers,
  });
  if (!response.ok) throw new Error(`Échec de l’envoi vidéo (${response.status}). La copie sur l’iPhone est conservée.`);
  await request(`/v1/videos/${videoId}/complete`, { method: "POST", body: "{}" });
  return true;
}
export async function deletePrivateLocalCopy(videoId: string, ownerId: string) {
  const d = await localDb();
  const row = await localFile(videoId, ownerId);
  if (row) {
    const file = new File(row.uri);
    if (file.exists) file.delete();
  }
  await d.runAsync("DELETE FROM private_video_files WHERE video_id=? AND owner_id=?", videoId, ownerId);
}

export async function clearPrivateVideos(ownerId: string) {
 const d=await localDb();
 const files=await d.getAllAsync<{uri:string}>("SELECT uri FROM private_video_files WHERE owner_id=?",ownerId);
 const pendingTable=await d.getFirstAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='meta_live_pending'");
 if(pendingTable)files.push(...await d.getAllAsync<{uri:string}>("SELECT uri FROM meta_live_pending WHERE user_id=?",ownerId));
 for(const {uri} of files){const file=new File(uri);if(file.exists)file.delete();}
 await d.runAsync("DELETE FROM private_video_files WHERE owner_id=?",ownerId);
 if(pendingTable)await d.runAsync("DELETE FROM meta_live_pending WHERE user_id=?",ownerId);
}
