/** Phone-controlled Meta capture + delayed private live. No passwords or R2 keys in app.
 * All video bytes remain in the iPhone app sandbox unless explicitly uploaded.
 */
import { requireOptionalNativeModule, type EventSubscription } from "expo-modules-core";
import { Directory, File, Paths } from "expo-file-system";
import { fetch as fileFetch } from "expo/fetch";
import { db } from "./local";
import { request } from "./auth";

export type SavedRecording = {
  uri: string; bytes: number; durationMs: number; startedAt: string; format: "video/quicktime";
};
export type CapturedSegment = {
  uri: string; index: number; bytes: number; startOffsetMs: number; durationMs: number;
};
export type MetaState = {
  state: "idle" | "connecting" | "connected" | "recording" | "error";
  message?: string;
};
export type MetaModule = {
  startPhoneCapture(directory: string): Promise<void>;
  deviceStatus(): Promise<DeviceStatus>;
  register(): Promise<void>;
  handleUrl(url: string): Promise<void>;
  connect(): Promise<void>;
  authorizeCamera(): Promise<void>;
  startCapture(directory: string, liveEnabled: boolean): Promise<void>;
  startRealtime(url:string, token:string):Promise<void>;
  stopRealtime():Promise<void>;
  realtimeStatus():Promise<{publishing:boolean;published:boolean;framesRecent:boolean;message:string}>;
  stopCapture(): Promise<SavedRecording | null>;
  recoverRecordings(directory: string): Promise<SavedRecording[]>;
  recoverSegments(directory: string): Promise<CapturedSegment[]>;
  captureStatus(): Promise<{ active: boolean; directory: string }>;
  disconnect(): Promise<void>;
  addListener(name: "onSegment", callback: (segment: CapturedSegment) => void): EventSubscription;
  addListener(name: "onRecordingSaved", callback: (saved: SavedRecording) => void): EventSubscription;
  addListener(name: "onState", callback: (state: MetaState) => void): EventSubscription;
  addListener(name: "onError", callback: (error: { message: string }) => void): EventSubscription;
};
export type DeviceStatus = {registered:boolean;available:boolean;connected:boolean;phoneCameraPermission:number;source:string;frames:number;width:number;height:number;framesRecent:boolean};
export const metaBridge = () => requireOptionalNativeModule<MetaModule>("RepereMeta");
export type LiveSettings = { enabled: boolean; mode: string; maximumSegmentBytes: number; targetLatencySeconds: number; message: string };
export type Playlist = {
  id: string; title: string; status: "idle" | "live" | "ended";
  routeId: string | null; nextFrom: number; pollAfterMs: number;
  segments: { index: number; startOffsetMs: number; durationMs: number; bytes: number; url: string }[];
};
export const getLiveSettings = () => request<LiveSettings>("/v1/live/config");
export const beginLive = (id: string, students: string[]) => request<{ ok: boolean }>(`/v1/videos/${id}/live/start`, {
  method:"POST",body:JSON.stringify({students}),
});
export const finishLive = (id: string) => request<{ ok: boolean }>(`/v1/videos/${id}/live/stop`, {
  method:"POST",body:"{}",
});
export const loadPlaylist = (id:string,from=0) => request<Playlist>(`/v1/videos/${id}/live/playlist?from=${from}`);

type Pending = { video_id:string; user_id:string; segment_index:number; uri:string; bytes:number; start_offset_ms:number; duration_ms:number; state:string };
async function pendingDb() {
  const d=await db();
  await d.execAsync(`CREATE TABLE IF NOT EXISTS meta_live_pending (
    video_id TEXT NOT NULL,user_id TEXT NOT NULL,segment_index INTEGER NOT NULL,
    uri TEXT NOT NULL,bytes INTEGER NOT NULL,start_offset_ms INTEGER NOT NULL,
    duration_ms INTEGER NOT NULL,state TEXT NOT NULL DEFAULT 'pending',
    PRIMARY KEY(video_id,segment_index)
  );`);
  return d;
}
export async function recordPending(videoId:string,userId:string,segment:CapturedSegment) {
  const file=new File(segment.uri);
  if(!file.exists ||file.size<=0)throw new Error("Segment vidéo manquant sur l'iPhone.");
  const d=await pendingDb();
  await d.runAsync(`INSERT INTO meta_live_pending(video_id,user_id,segment_index,uri,bytes,start_offset_ms,duration_ms,state)
    VALUES(?,?,?,?,?,?,?,'pending') ON CONFLICT(video_id,segment_index) DO NOTHING`,
    videoId,userId,segment.index,file.uri,file.size,segment.startOffsetMs,segment.durationMs);
}
export async function uploadPending(videoId:string,userId:string) {
  const d=await pendingDb();
  const rows=await d.getAllAsync<Pending>(`SELECT * FROM meta_live_pending WHERE video_id=? AND user_id=? AND state='pending' ORDER BY segment_index`,videoId,userId);
  let succeeded=0;
  for(const row of rows) {
    const file=new File(row.uri);
    if(!file.exists||file.size!==row.bytes)throw new Error(`Segment ${row.segment_index} absent ou incomplet. Autres données préservées.`);
    let signed: {uploadUrl:string;headers:Record<string,string>};
    try {
      signed=await request<typeof signed>(`/v1/videos/${videoId}/live/segments`,{
        method:"POST",body:JSON.stringify({index:row.segment_index,bytes:file.size,mimeType:"video/mp4",startOffsetMs:row.start_offset_ms,durationMs:row.duration_ms}),
      });
    } catch (e) {
      // A prior attempt may have uploaded the full segment before losing the ACK.
      // Confirm remote integrity before trying to overwrite the reserved object.
      try {
        await request(`/v1/videos/${videoId}/live/segments/${row.segment_index}/complete`,{method:"POST",body:"{}"});
        await d.runAsync("UPDATE meta_live_pending SET state='sent' WHERE video_id=? AND segment_index=?",videoId,row.segment_index);
        succeeded++;
        continue;
      } catch { /* Pending object still absent or incomplete; re-sign same key. */ }
      signed=await request<typeof signed>(`/v1/videos/${videoId}/live/segments/${row.segment_index}/retry`,{method:"POST",body:"{}"});
    }
    const response=await fileFetch(signed.uploadUrl,{method:"PUT",body:file,headers:signed.headers});
    if(!response.ok)throw new Error(`Téléversement du segment ${row.segment_index} interrompu (${response.status}). La vidéo reste sur l'iPhone.`);
    await request(`/v1/videos/${videoId}/live/segments/${row.segment_index}/complete`,{method:"POST",body:"{}"});
    await d.runAsync("UPDATE meta_live_pending SET state='sent' WHERE video_id=? AND segment_index=?",videoId,row.segment_index);
    succeeded++;
  }
  return succeeded;
}
export async function pendingCount(videoId:string,userId:string) {
  const d=await pendingDb();
  const row=await d.getFirstAsync<{n:number}>("SELECT COUNT(*) n FROM meta_live_pending WHERE video_id=? AND user_id=? AND state='pending'",videoId,userId);
  return row?.n||0;
}

export async function listLocalSegments(videoId:string,userId:string) {
  const d=await pendingDb();
  return d.getAllAsync<Pending>("SELECT * FROM meta_live_pending WHERE video_id=? AND user_id=? ORDER BY segment_index",videoId,userId);
}
export const createMetaSession = (title:string,routeId?:string|null) => request<{id:string}>("/v1/videos",{
  method:"POST",body:JSON.stringify({title,routeId:routeId||null}),
});

/** Rebuild SQLite upload queue from finalized HEVC/MP4 sidecars in iPhone storage.
 * The manifest is written by Swift before its onSegment event, so losing JS listeners
 * or restarting the app does not orphan existing completed segments.
 */
export async function recoverLocalSegments(videoId:string,userId:string) {
  const native=metaBridge();
  if(!native) return 0;
  const folder = new Directory(Paths.document,"meta-live",videoId);
  if(!folder.exists)return 0;
  const segments=await native.recoverSegments(folder.uri);
  for(const segment of segments)await recordPending(videoId,userId,segment);
  return segments.length;
}

/** Recovery of user-visible, complete recordings (one MOV per lesson, not a clip list). */
export async function recoverLocalRecordings(videoId:string,userId:string) {
  const native=metaBridge();
  if(!native)return [];
  const folder=new Directory(Paths.document,"meta-live",videoId);
  if(!folder.exists)return [];
  const recordings=await native.recoverRecordings(folder.uri);
  if(recordings.length) {
    const {saveCapturedVideo}=await import("./private-videos");
    // Restore the last successfully finalized file to the existing upload UI.
    await saveCapturedVideo(videoId,userId,recordings[recordings.length-1]);
  }
  return recordings;
}
