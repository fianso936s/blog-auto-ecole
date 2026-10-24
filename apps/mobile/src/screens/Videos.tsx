import product from "../../../../packages/product/product.json";
import { metaBridge, createMetaSession } from "../services/meta-live";
import { recordedVideoHtml } from "../generated/video-player";
import { ContentSafety } from "../components/ContentSafety";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, AppState, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { MetaLivePanel } from "../components/MetaLivePanel";
import { changeRTCAudience } from "../services/webrtc";
import type { RouteSummary } from "@repere/core";
import { useApp } from "../state";
import { colors, fonts, radius, shadow, styles as s } from "../theme";
import { Badge, Button, Dropdown, Empty, Field, Icon, IconButton, LinkButton, PageHeading, Sheet } from "../components/UI";
import { request } from "../services/auth";
import {
  deletePrivateLocalCopy,
  fetchGrants,
  fetchVideoConfig,
  fetchVideos,
  importVideo,
  localFile,
  playback,
  removeVideo,
  retryVideo,
  saveGrants,
  uploadPrivateVideo,
  type Video,
  type VideoConfig,
} from "../services/private-videos";

type Student = { id: string; name: string; email: string };
type Audience = "private" | "all" | "selected";
function Player({ uri }: { uri: string }) {
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html: recordedVideoHtml(uri) }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      style={{ height: 420, backgroundColor: colors.paper }}
    />
  );
}
const stateLabel = (v: Video) =>
  v.state === "ready" ? "Replay disponible" : v.state === "uploading" ? "Envoi à reprendre" : "Copie sur l’appareil d’origine";

/** Mirrors the website's Vidéos page: heading, teacher tools, "Votre vidéothèque", Meta callout. */
export function Videos() {
  const app = useApp();
  const teacher = app.profile?.role !== "student";
  const [items, setItems] = useState<Video[]>([]);
  const [config, setConfig] = useState<VideoConfig | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [selected, setSelected] = useState<Video | null>(null);
  const [grants, setGrants] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience>("private");
  const [viewUrl, setViewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [routeId, setRouteId] = useState("");
  const [session, setSession] = useState<null | "capture" | "live">(null);
  const [sessionRoute, setSessionRoute] = useState("");
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [local, setLocal] = useState(false);
  const error = (e: unknown) => app.setMessage(e instanceof Error ? e.message : "Opération impossible.");
  const reload = useCallback(async () => {
    if (!app.profile) return;
    try {
      setConfig(await fetchVideoConfig());
      const videos = await fetchVideos();
      setItems(videos.videos);
      setSelected((previous) => {
        if (previous && !videos.videos.some((v) => v.id === previous.id)) {
          app.setMessage("L’accès à cette vidéo a été retiré.");
          return null;
        }
        return previous ? videos.videos.find((v) => v.id === previous.id) || null : null;
      });
      if (teacher) setStudents((await request<{ students: Student[] }>("/v1/students")).students);
    } catch (e) {
      error(e);
    } finally {
      setLoaded(true);
    }
  }, [app.profile?.id, teacher]);
  useEffect(() => {
    void reload();
  }, [reload]);
  // Lightweight metadata polling so lives appear/disappear; video bytes are never polled.
  useEffect(() => {
    if (!app.profile) return;
    let mounted = true,
      running = false;
    const timer = setInterval(() => {
      if (running || AppState.currentState !== "active") return;
      running = true;
      void fetchVideos()
        .then(({ videos }) => {
          if (!mounted) return;
          setItems(videos);
          setSelected((previous) => (previous ? videos.find((v) => v.id === previous.id) || null : null));
        })
        .catch(() => {})
        .finally(() => {
          running = false;
        });
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [app.profile?.id]);
  useEffect(() => {
    if (!teacher) return;
    let alive = true,
      running = false;
    const report = async () => {
      if (running || AppState.currentState !== "active") return;
      running = true;
      try {
        const bridge = metaBridge(),
          status = bridge ? await bridge.deviceStatus() : null;
        if (alive)
          await request("/v1/meta/device", {
            method: "PUT",
            body: JSON.stringify({
              modulePresent: !!bridge,
              available: !!status?.available,
              connected: !!status?.connected,
              registered: !!status?.registered,
              framesRecent: !!status?.framesRecent,
              source: status?.source || "none",
              appVersion: product.version,
            }),
          });
      } catch {
      } finally {
        running = false;
      }
    };
    void report();
    const timer = setInterval(() => void report(), 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [teacher, app.profile?.id]);
  const ownRoutes = app.routes.filter((r: RouteSummary) => r.authorId === app.profile?.id);
  const routeOptions = [{ id: "", label: "Aucun" }, ...ownRoutes.map((r) => ({ id: r.id, label: r.name }))];
  async function choose(item: Video, autoplay = false) {
    try {
      setSelected(item);
      setViewUrl("");
      setGrants([]);
      setAudience("private");
      if (teacher && item.author_id === app.profile?.id) {
        const [grant, copy] = await Promise.all([
          fetchGrants(item.id) as Promise<{ students: string[]; published?: boolean }>,
          localFile(item.id, app.profile!.id),
        ]);
        setGrants(grant.students);
        setAudience(grant.published ? (grant.students.length === students.length && students.length ? "all" : "selected") : "private");
        setLocal(!!copy);
      }
      if (autoplay && item.state === "ready" && item.live_status !== "live") await play(item);
    } catch (e) {
      error(e);
    }
  }
  async function play(item: Video) {
    setBusy(true);
    try {
      setViewUrl((await playback(item.id)).url);
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function newSession() {
    setBusy(true);
    try {
      const created = await createMetaSession(`Leçon du ${new Date().toLocaleDateString("fr-FR")}`, sessionRoute || null);
      setSession(null);
      await reload();
      await choose({
        id: created.id,
        author_id: app.profile!.id,
        author_name: "",
        title: "Nouvelle leçon",
        route_id: sessionRoute || null,
        route_name: ownRoutes.find((r) => r.id === sessionRoute)?.name || null,
        state: "local",
        visibility: "private",
        bytes: 0,
        duration_ms: null,
        created_at: new Date().toISOString(),
        mime_type: "video/mp4",
        live_status: "idle",
        webrtc_started_at: null,
      });
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function create(source: "library" | "files") {
    if (!app.profile) return;
    setBusy(true);
    try {
      const id = await importVideo(app.profile.id, title.trim() || "Leçon filmée", routeId || null, source);
      if (id) {
        setCreating(false);
        setTitle("");
        setRouteId("");
        await reload();
        const settings = await fetchVideoConfig().catch(() => config);
        if (settings) setConfig(settings);
        if (settings?.uploadEnabled) {
          const fresh = (await fetchVideos()).videos.find((v) => v.id === id);
          if (fresh) await sendToCloud(fresh);
        } else app.setMessage("Vidéo conservée sur cet iPhone. Le stockage distant n’est pas encore disponible.");
      }
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  /** Website: "Envoyer dans le cloud" (retries an interrupted upload first). */
  async function sendToCloud(item: Video) {
    if (!app.profile) return;
    setSending(item.id);
    try {
      if (!(await localFile(item.id, app.profile.id)))
        throw new Error("La copie locale se trouve sur l’appareil qui a importé cette vidéo. Utilisez cet appareil ou importez un nouveau fichier.");
      const settings = await fetchVideoConfig();
      setConfig(settings);
      if (!settings.uploadEnabled) throw new Error(`${settings.message} La vidéo reste sur cet iPhone.`);
      if (item.state === "uploading") await retryVideo(item.id).catch(() => {});
      await uploadPrivateVideo(item.id, app.profile.id);
      await reload();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      app.setMessage("Vidéo envoyée. Choisissez maintenant qui peut la voir.");
      const fresh = (await fetchVideos()).videos.find((v) => v.id === item.id);
      if (fresh) await choose(fresh);
    } catch (e) {
      error(e);
    } finally {
      setSending(null);
    }
  }
  async function saveAccess(choice: Audience = audience) {
    if (!selected) return;
    setBusy(true);
    try {
      const published = choice !== "private";
      // A live viewer already connected must be removed from the room, not only from the database.
      if (!published && selected.live_status === "live" && selected.webrtc_started_at) await changeRTCAudience(selected.id, []);
      else await saveGrants(selected.id, choice === "all" ? students.map((st) => st.id) : grants, published);
      await reload();
      setSelected(null);
      app.setMessage(published ? "Accès enregistrés." : "Partage désactivé : vidéo privée.");
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function makePrivate(item: Video) {
    try {
      const current = await fetchGrants(item.id);
      await saveGrants(item.id, current.students, false);
      await reload();
      app.setMessage("Vidéo passée en privé.");
    } catch (e) {
      error(e);
    }
  }
  function confirmDelete(item: Video) {
    if (!app.profile) return;
    const userId = app.profile.id;
    Alert.alert("Supprimer cette vidéo ?", "La vidéo et ses accès seront supprimés. La suppression s’applique aussi au site.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () =>
          void (async () => {
            setBusy(true);
            try {
              await removeVideo(item.id);
              await deletePrivateLocalCopy(item.id, userId);
              if (selected?.id === item.id) setSelected(null);
              await reload();
              app.setMessage("Vidéo supprimée.");
            } catch (e) {
              error(e);
            } finally {
              setBusy(false);
            }
          })(),
      },
    ]);
  }
  async function refresh() {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }
  const sorted = [...items].sort((a, b) => Number(b.live_status === "live") - Number(a.live_status === "live"));
  const mine = (v: Video) => v.author_id === app.profile?.id;
  return (
    <>
      <ScrollView
        contentContainerStyle={[s.content, { gap: 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.wine} onRefresh={() => void refresh()} />}
      >
        <PageHeading
          eyebrow="REVOIR POUR MIEUX COMPRENDRE"
          title="Vidéos"
          dot
          subtitle="Vos parcours en images, et vos leçons en direct."
          icon="videocam-outline"
        />
        {teacher && (
          <View style={[{ borderRadius: radius.xl, backgroundColor: colors.night, padding: 24, gap: 18, overflow: "hidden" }, shadow.lg]}>
            <View style={{ position: "absolute", left: -90, bottom: -150, width: 320, height: 320, borderRadius: 160, backgroundColor: "rgba(106,34,54,0.8)" }} />
            <View style={{ gap: 10 }}>
              <View style={{ alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: "rgba(255,248,242,0.14)" }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.4, color: colors.blush }}>VOTRE REGARD D’ENSEIGNANT</Text>
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 27, lineHeight: 31, letterSpacing: -0.8, color: colors.paper }}>
                Le réel devient{"\n"}un support de cours.
              </Text>
              <Text style={[s.body, { color: colors.blush }]}>Capturez une situation, importez un parcours ou partagez un direct avec vos élèves.</Text>
            </View>
            <View style={{ gap: 10 }}>
              <Button label="Capturer une vidéo" icon="videocam-outline" onPress={() => setSession(session === "capture" ? null : "capture")} />
              <Button label={busy && creating ? "Import en cours…" : "Importer une vidéo"} icon="add" secondary disabled={busy} onPress={() => setCreating(true)} />
              <Button label="Lancer un direct" icon="play" secondary onPress={() => setSession(session === "live" ? null : "live")} />
            </View>
          </View>
        )}
        {teacher && session && (
          <View style={s.card}>
            <View style={s.between}>
              <Text style={[s.heading, { flex: 1 }]}>{session === "live" ? "Lancer un direct" : "Capturer une vidéo"}</Text>
              <IconButton name="close" label="Annuler" onPress={() => setSession(null)} />
            </View>
            <Dropdown label="Parcours associé · facultatif" value={sessionRoute} options={routeOptions} onChange={setSessionRoute} />
            <Button label="Créer la séance" icon="arrow-forward" onPress={() => void newSession()} busy={busy} />
            <Text style={s.caption}>
              {session === "live"
                ? "Dans la séance, choisissez les élèves puis « Démarrer le direct ». Caméra de l’iPhone ou lunettes Meta."
                : "Dans la séance, touchez « Enregistrer une vidéo ». Elle reste privée jusqu’à ce que vous choisissiez les élèves."}
            </Text>
          </View>
        )}
        <View style={s.between}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[s.heading, { fontSize: 21 }]}>Votre vidéothèque</Text>
            <Text style={s.muted}>
              {items.length} vidéo{items.length > 1 ? "s" : ""} · Mise à jour automatique
            </Text>
          </View>
          <IconButton name="refresh" label="Actualiser les vidéos" onPress={() => void refresh()} />
        </View>
        {sorted.map((v) => {
          const live = v.live_status === "live";
          return (
            <View key={v.id} style={[s.card, { padding: 0, gap: 0, overflow: "hidden", borderColor: live ? colors.red : colors.line }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={live ? `Rejoindre le direct : ${v.title}` : `Lire ${v.title}`}
                onPress={() => void choose(v, true)}
                style={({ pressed }) => ({ height: 150, backgroundColor: colors.night, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1 })}
              >
                {[38, 74, 110].map((top, i) => (
                  <View key={top} style={{ position: "absolute", left: -20, right: -20, top, height: 1.4, backgroundColor: colors.blush, opacity: [0.18, 0.1, 0.14][i], transform: [{ rotate: `${[-6, 4, -2][i]}deg` }] }} />
                ))}
                <View style={[{ width: 58, height: 58, borderRadius: 29, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center" }, shadow.lg]}>
                  <Icon name="play" size={26} />
                </View>
                <View style={{ position: "absolute", top: 12, left: 12 }}>
                  {live ? <Badge label="● EN DIRECT" tone="red" /> : (
                    <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: "rgba(255,253,250,0.92)" }}>
                      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.wine }}>{stateLabel(v)}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
              <View style={{ padding: 16, gap: 8 }}>
                <Text numberOfLines={2} style={[s.heading, { fontSize: 17 }]}>{v.title}</Text>
                <Text style={s.muted}>
                  {v.route_name || "Séance pédagogique"}
                  {v.author_name ? ` · ${v.author_name}` : ""}
                </Text>
                <View style={[s.between, { gap: 8 }]}>
                  <Text style={s.caption}>{new Date(v.created_at).toLocaleDateString("fr-FR")}</Text>
                  <Badge label={v.visibility === "students" ? "Visible par les élèves autorisés" : "Privée"} tone={v.visibility === "students" ? "green" : "neutral"} />
                </View>
                {mine(v) && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14 }}>
                    {v.state !== "ready" && (
                      <LinkButton label={sending === v.id ? "Envoi en cours…" : "Envoyer dans le cloud"} icon="cloud-upload-outline" disabled={sending === v.id} onPress={() => void sendToCloud(v)} />
                    )}
                    {v.state === "ready" && (
                      <LinkButton label={v.visibility === "students" ? "Modifier la visibilité" : "Publier pour les élèves"} onPress={() => void choose(v)} />
                    )}
                    {v.visibility === "students" && !live && <LinkButton label="Passer en privé" onPress={() => void makePrivate(v)} />}
                    {!live && <LinkButton label="Supprimer cette vidéo" tone={colors.red} onPress={() => confirmDelete(v)} />}
                  </View>
                )}
                <ContentSafety kind="video" id={v.id} authorId={v.author_id} />
              </View>
            </View>
          );
        })}
        {!items.length && (
          <Empty
            title={loaded ? "Les images font aussi apprendre." : "Chargement des vidéos…"}
            description={teacher ? "Importez une première vidéo ou lancez un direct." : "Les vidéos et les directs partagés avec vous apparaîtront ici."}
          />
        )}
        <View style={[s.card, { backgroundColor: colors.cream, borderColor: colors.line, gap: 6 }]}>
          <Text style={[s.body, { fontFamily: fonts.bodyBold }]}>Depuis vos lunettes Meta</Text>
          <Text style={s.muted}>
            Connectez vos lunettes depuis une séance (Capturer une vidéo ou Lancer un direct), ou importez les vidéos exportées depuis l’application Meta AI. Les vidéos conservées uniquement sur cet iPhone doivent être envoyées dans le cloud pour être visibles sur le site.
          </Text>
        </View>
      </ScrollView>
      <Sheet visible={creating} title="Importer une vidéo" onClose={() => setCreating(false)}>
        <Field label="Nom" value={title} onChangeText={setTitle} placeholder="Ex. Priorités à droite" maxLength={120} />
        <Dropdown label="Parcours associé · facultatif" value={routeId} options={routeOptions} onChange={setRouteId} />
        <Text style={s.muted}>Choisissez une vidéo MP4 ou MOV. Elle reste privée.</Text>
        <Text style={s.caption}>L’envoi en ligne est limité à 500 Mio par fichier. La copie reste sur l’iPhone.</Text>
        <Button label="Choisir dans la Pellicule" icon="images-outline" onPress={() => void create("library")} busy={busy} />
        <Button label="Choisir dans Fichiers" secondary icon="folder-open-outline" onPress={() => void create("files")} disabled={busy} />
      </Sheet>
      <Sheet visible={!!selected} title={selected?.title || "Vidéo"} onClose={() => { setSelected(null); setViewUrl(""); }}>
        {selected && (
          <View style={{ gap: 13 }}>
            <ContentSafety kind="video" id={selected.id} authorId={selected.author_id} onBlocked={() => setSelected(null)} />
            <Text style={s.muted}>
              {selected.route_name || "Séance pédagogique"} · {selected.visibility === "students" ? "Visible par les élèves autorisés" : "Privée"}
            </Text>
            {selected.state === "ready" && !viewUrl && <Button label="Lire la vidéo" icon="play" onPress={() => void play(selected)} busy={busy} />}
            {!!viewUrl && <Player key={viewUrl} uri={viewUrl} />}
            <MetaLivePanel
              videoId={selected.id}
              liveStatus={selected.live_status || "idle"}
              webRTCUsed={!!selected.webrtc_started_at}
              videoReady={selected.state === "ready"}
              students={students}
              onUpdated={reload}
            />
            {teacher && mine(selected) && (
              <>
                {local && selected.state !== "ready" && (
                  <Button
                    label={sending === selected.id ? "Envoi en cours…" : "Envoyer dans le cloud"}
                    icon="cloud-upload-outline"
                    disabled={!config?.uploadEnabled || sending === selected.id}
                    onPress={() => void sendToCloud(selected)}
                  />
                )}
                {selected.live_status !== "idle" && (
                  <Button label="Retirer l’accès au direct" secondary onPress={() => void saveAccess("private")} busy={busy} />
                )}
                {selected.state === "ready" && (
                  <View style={{ gap: 10, paddingTop: 6 }}>
                    <Dropdown
                      label="Qui peut voir cette vidéo ?"
                      value={audience}
                      options={[
                        { id: "private", label: "Privé · moi uniquement" },
                        { id: "all", label: "Tous mes élèves actuels" },
                        { id: "selected", label: "Élèves sélectionnés" },
                      ]}
                      onChange={setAudience}
                    />
                    <Text style={s.caption}>La publication donne accès aux élèves connectés. Vous pouvez retirer cet accès à tout moment.</Text>
                    {audience === "selected" &&
                      students.map((st) => {
                        const on = grants.includes(st.id);
                        return (
                          <Pressable
                            key={st.id}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: on }}
                            onPress={() => setGrants((prev) => (on ? prev.filter((id) => id !== st.id) : [...prev, st.id]))}
                            style={[s.row, { minHeight: 48 }]}
                          >
                            <Icon name={on ? "checkbox" : "square-outline"} size={22} />
                            <View style={{ flex: 1 }}>
                              <Text style={[s.body, { fontFamily: fonts.bodySemi }]}>{st.name}</Text>
                              <Text style={s.caption}>{st.email}</Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    {audience !== "private" && !students.length && (
                      <Empty title="Aucun élève lié" description="Créez une invitation depuis Mon espace." />
                    )}
                    <Button
                      label="Enregistrer les accès"
                      onPress={() => void saveAccess()}
                      disabled={audience === "selected" && !grants.length}
                      busy={busy}
                    />
                  </View>
                )}
                {selected.live_status !== "live" && (
                  <Button label="Supprimer cette vidéo" danger secondary icon="trash-outline" onPress={() => confirmDelete(selected)} busy={busy} />
                )}
              </>
            )}
          </View>
        )}
      </Sheet>
    </>
  );
}
