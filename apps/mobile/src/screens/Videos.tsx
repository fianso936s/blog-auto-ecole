import product from "../../../../packages/product/product.json";
import {AppState} from "react-native";
import {metaBridge} from "../services/meta-live";
import {recordedVideoHtml} from "../generated/video-player";
import { ContentSafety } from "../components/ContentSafety";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { MetaLivePanel } from "../components/MetaLivePanel";
import { changeRTCAudience } from "../services/webrtc";
import { createMetaSession } from "../services/meta-live";
import type { RouteSummary } from "@repere/core";
import { useApp } from "../state";
import { colors, styles as s } from "../theme";
import { Button, Chip, Field, Icon, IconButton, Sheet } from "../components/UI";
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
const fmt = (n: number) => `${Math.round(n / 1024 / 1024)} Mio`;
function Player({ uri }: { uri: string }) {
  return <WebView originWhitelist={["*"]} source={{html:recordedVideoHtml(uri)}} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction={false} style={{height:420,backgroundColor:colors.paper}} />;
}
export function Videos() {
  const app = useApp();
  const teacher = app.profile?.role !== "student";
  const [items, setItems] = useState<Video[]>([]);
  const [videoFilter, setVideoFilter] = useState<"all" | "live" | "recorded">(
    "all",
  );
  const visibleItems = items.filter(
    (item) =>
      videoFilter === "all" ||
      (videoFilter === "live"
        ? item.live_status === "live"
        : item.live_status !== "live"),
  );
  const [config, setConfig] = useState<VideoConfig | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Video | null>(null);
  const [grants, setGrants] = useState<string[]>([]);
  const [viewUrl, setViewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [routeId, setRouteId] = useState<string | null>(null);
  const [metaRouteId, setMetaRouteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [local, setLocal] = useState(false);
  const error = (e: unknown) =>
    app.setMessage(e instanceof Error ? e.message : "Opération impossible.");
  const reload = useCallback(async () => {
    if (!app.profile) return;
    try {
      const settings = await fetchVideoConfig();
      setConfig(settings);
      const videos = await fetchVideos();
      setItems(videos.videos);
      setSelected((previous) =>
        previous
          ? videos.videos.find((v) => v.id === previous.id) || null
          : null,
      );
      if (teacher) {
        const list = await request<{ students: Student[] }>("/v1/students");
        setStudents(list.students);
      }
    } catch (e) {
      error(e);
    }
  }, [app.profile?.id, teacher]);
  useEffect(() => {
    void reload();
  }, [reload]);
  // A student's list updates automatically while an instructor starts/stops a live.
  // Poll only lightweight metadata; never poll/download video bytes from Neon.
  useEffect(() => {
    if (!app.profile) return;
    let mounted = true;
    const timer = setInterval(() => {
      void fetchVideos()
        .then(({ videos }) => {
          if (!mounted) return;
          setItems(videos);
          setSelected((previous) =>
            previous ? videos.find((v) => v.id === previous.id) || null : null,
          );
        })
        .catch(() => {});
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [app.profile?.id]);
  useEffect(()=>{
    if(!teacher)return;let alive=true,running=false;
    const report=async()=>{if(running||AppState.currentState!=="active")return;running=true;try{const bridge=metaBridge(),status=bridge?await bridge.deviceStatus():null;if(alive)await request("/v1/meta/device",{method:"PUT",body:JSON.stringify({modulePresent:!!bridge,available:!!status?.available,connected:!!status?.connected,registered:!!status?.registered,framesRecent:!!status?.framesRecent,source:status?.source||"none",appVersion:product.version})});}catch{}finally{running=false;}};
    void report();const timer=setInterval(()=>void report(),15000);return()=>{alive=false;clearInterval(timer);};
  },[teacher,app.profile?.id]);
  async function choose(item: Video) {
    try {
      setSelected(item);
      setViewUrl("");
      setGrants([]);
      if (teacher) {
        const [grant, copy] = await Promise.all([
          fetchGrants(item.id),
          localFile(item.id, app.profile!.id),
        ]);
        setGrants(grant.students);
        setLocal(!!copy);
      }
    } catch (e) {
      error(e);
    }
  }
  async function play(item: Video) {
    setBusy(true);
    try {
      const p = await playback(item.id);
      setViewUrl(p.url);
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function newMetaSession() {
    setPreparing(false);
    setBusy(true);
    try {
      const created = await createMetaSession(
        `Leçon du ${new Date().toLocaleDateString("fr-FR")}`,
        metaRouteId,
      );
      await reload();
      await choose({
        id: created.id,
        author_id: app.profile!.id,
        author_name: "",
        title: "Nouvelle leçon",
        route_id: metaRouteId,
        route_name: ownRoutes.find((r) => r.id === metaRouteId)?.name || null,
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
  async function create() {
    if (!app.profile) return;
    setBusy(true);
    try {
      const id = await importVideo(
        app.profile.id,
        title.trim() || "Leçon filmée",
        routeId,
      );
      if (id) {
        setCreating(false);
        setTitle("");
        setRouteId(null);
        await reload();
        app.setMessage(
          "Vidéo conservée sur cet iPhone. Elle reste privée par défaut.",
        );
      }
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function upload() {
    if (!selected || !app.profile) return;
    setBusy(true);
    try {
      await uploadPrivateVideo(selected.id, app.profile.id);
      await reload();
      setSelected(null);
      app.setMessage(
        "Vidéo sauvegardée en privé. Choisissez les élèves avant de la publier.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function retry() {
    if (!selected) return;
    setBusy(true);
    try {
      await retryVideo(selected.id);
      await reload();
      setSelected(null);
      app.setMessage(
        "Envoi réinitialisé. Le fichier sur l’iPhone est conservé.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  async function save(published: boolean) {
    if (!selected) return;
    setBusy(true);
    try {
      // A live viewer already in the SFU must be kicked, not merely removed from the DB.
      if (
        !published &&
        selected.live_status === "live" &&
        selected.webrtc_started_at
      ) {
        await changeRTCAudience(selected.id, []);
      } else {
        await saveGrants(selected.id, grants, published);
      }
      await reload();
      setSelected(null);
      app.setMessage(
        published
          ? "Accès accordé uniquement aux élèves sélectionnés."
          : "Partage désactivé : vidéo privée.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusy(false);
    }
  }
  function confirmDelete() {
    if (!selected || !app.profile) return;
    const id = selected.id,
      userId = app.profile.id;
    Alert.alert(
      "Supprimer la vidéo ?",
      "La vidéo et les accès des élèves seront supprimés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () =>
            void (async () => {
              setBusy(true);
              try {
                await removeVideo(id);
                await deletePrivateLocalCopy(id, userId);
                setSelected(null);
                await reload();
              } catch (e) {
                error(e);
              } finally {
                setBusy(false);
              }
            })(),
        },
      ],
    );
  }
  const ownRoutes = app.routes.filter(
    (r: RouteSummary) => r.authorId === app.profile?.id,
  );
  async function refresh() {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.wine}
            onRefresh={() => void refresh()}
          />
        }
      >
        <View style={s.between}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[s.title, { fontSize: 26, lineHeight: 32 }]}>
              Vidéos
            </Text>
            <Text style={s.caption}>
              {teacher
                ? "Vos leçons et vos directs"
                : "Les leçons de votre enseignant"}
            </Text>
          </View>
          <IconButton
            name="refresh-outline"
            label="Actualiser les vidéos"
            onPress={() => void refresh()}
          />
        </View>
        {teacher && (
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button
                compact
                label="Filmer"
                icon="videocam-outline"
                busy={busy}
                onPress={() => setPreparing((value) => !value)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                compact
                label="Importer"
                disabled={busy}
                icon="add-outline"
                secondary
                onPress={() => setCreating(true)}
              />
            </View>
          </View>
        )}
        {teacher && preparing && (
          <View style={s.card}>
            <View style={s.between}>
              <Text style={s.heading}>Nouvelle séance</Text>
              <IconButton
                name="close"
                label="Annuler la nouvelle séance"
                onPress={() => setPreparing(false)}
              />
            </View>
            <Text style={s.label}>Parcours associé · facultatif</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <Chip
                label="Aucun"
                active={!metaRouteId}
                onPress={() => setMetaRouteId(null)}
              />
              {ownRoutes.map((r) => (
                <Chip
                  key={r.id}
                  label={r.name}
                  active={metaRouteId === r.id}
                  onPress={() => setMetaRouteId(r.id)}
                />
              ))}
            </ScrollView>
            <Button
              label="Créer la séance"
              onPress={() => void newMetaSession()}
              busy={busy}
            />
            <Text style={s.caption}>
              Privée. Vous choisissez ensuite les élèves autorisés.
            </Text>
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Chip
            label="Tout"
            active={videoFilter === "all"}
            onPress={() => setVideoFilter("all")}
          />
          <Chip
            label={`En direct · ${items.filter((item) => item.live_status === "live").length}`}
            tone="red"
            active={videoFilter === "live"}
            onPress={() => setVideoFilter("live")}
          />
          <Chip
            label="Enregistrements"
            tone="blue"
            active={videoFilter === "recorded"}
            onPress={() => setVideoFilter("recorded")}
          />
        </View>
        {visibleItems.length === 0 ? (
          <View style={s.card}>
            <Icon name="videocam-outline" size={24} />
            <Text style={s.heading}>
              {videoFilter === "live"
                ? "Aucun direct en cours"
                : "Aucune vidéo"}
            </Text>
            <Text style={s.muted}>
              {teacher
                ? "Filmez une leçon ou importez une vidéo."
                : "Les vidéos partagées avec vous apparaîtront ici."}
            </Text>
          </View>
        ) : (
          [...visibleItems]
            .sort(
              (a, b) =>
                Number(b.live_status === "live") -
                Number(a.live_status === "live"),
            )
            .map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={
                  item.live_status === "live"
                    ? `Rejoindre le direct : ${item.title}`
                    : item.title
                }
                onPress={() => void choose(item)}
                style={({ pressed }) => [
                  s.card,
                  {
                    padding: 16,
                    gap: 7,
                    opacity: pressed ? 0.75 : 1,
                    borderColor:
                      item.live_status === "live" ? colors.red : colors.line,
                  },
                ]}
              >
                <View style={s.between}>
                  <Text
                    numberOfLines={2}
                    style={[s.heading, { fontSize: 18, flex: 1 }]}
                  >
                    {item.title}
                  </Text>
                  <Icon
                    name={
                      item.live_status === "live"
                        ? "play-circle"
                        : "chevron-forward"
                    }
                  />
                </View>
                <Text style={s.caption}>
                  {item.route_name ||
                    item.author_name ||
                    (teacher ? "Votre leçon" : "Votre enseignant")}
                </Text>
                <Text
                  style={[
                    s.caption,
                    {
                      color:
                        item.live_status === "live" ? colors.red : colors.muted,
                    },
                  ]}
                >
                  {item.live_status === "live"
                    ? "● En direct · Rejoindre"
                    : item.live_status === "ended"
                      ? "Direct terminé"
                      : item.state === "ready"
                        ? item.visibility === "students"
                          ? "Partagée"
                          : "Privée · sauvegardée"
                        : item.state === "uploading"
                          ? "Envoi à terminer"
                          : "Sur cet iPhone"}
                  {item.bytes ? ` · ${fmt(item.bytes)}` : ""}
                </Text>
              </Pressable>
            ))
        )}
      </ScrollView>
      <Sheet
        visible={creating}
        title="Importer une vidéo"
        onClose={() => setCreating(false)}
      >
        <Field
          label="Nom"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Priorités à droite"
        />
        <Text style={s.label}>Parcours associé · facultatif</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Chip
            label="Aucun"
            active={!routeId}
            onPress={() => setRouteId(null)}
          />
          {ownRoutes.map((r) => (
            <Chip
              key={r.id}
              label={r.name}
              active={routeId === r.id}
              onPress={() => setRouteId(r.id)}
            />
          ))}
        </ScrollView>
        <Text style={s.muted}>
          Choisissez une vidéo MP4 ou MOV. Elle reste privée.
        </Text>
        <Text style={s.caption}>
          L’import dépend de la place disponible sur l’iPhone. L’envoi en ligne
          est limité à 500 Mio par fichier.
        </Text>
        <Button
          label="Choisir une vidéo"
          onPress={() => void create()}
          busy={busy}
        />
      </Sheet>
      <Sheet
        visible={!!selected}
        title={selected?.title || "Vidéo"}
        onClose={() => {
          setSelected(null);
          setViewUrl("");
        }}
      >
        {selected && (
          <ContentSafety
            kind="video"
            id={selected.id}
            authorId={selected.author_id}
            onBlocked={() => setSelected(null)}
          />
        )}
        {selected && (
          <View style={{ gap: 13 }}>
            <Text style={s.muted}>
              {selected.route_name || "Leçon"} ·{" "}
              {selected.visibility === "students"
                ? "Partagée avec vos élèves"
                : "Privée"}
            </Text>
            {selected.state === "ready" && (
              <Button
                label="Lire la vidéo"
                icon="play-outline"
                onPress={() => void play(selected)}
                busy={busy}
              />
            )}
            {!!viewUrl && <Player key={viewUrl} uri={viewUrl} />}
            <MetaLivePanel
              videoId={selected.id}
              liveStatus={selected.live_status || "idle"}
              webRTCUsed={!!selected.webrtc_started_at}
              videoReady={selected.state === "ready"}
              students={students}
              onUpdated={reload}
            />
            {teacher && (
              <>
                {local && selected.state === "local" && (
                  <Button
                    label="Sauvegarder la vidéo"
                    onPress={() => void upload()}
                    disabled={!config?.uploadEnabled}
                    busy={busy}
                  />
                )}
                {selected.state === "uploading" && (
                  <>
                    <Text style={s.muted}>
                      Envoi interrompu. La copie reste sur cet iPhone.
                    </Text>
                    <Button
                      label="Réessayer l’envoi"
                      secondary
                      onPress={() => void retry()}
                      busy={busy}
                    />
                  </>
                )}
                {selected.live_status !== "idle" && (
                  <Button
                    label="Retirer l’accès au direct"
                    secondary
                    onPress={() => void save(false)}
                    busy={busy}
                  />
                )}
                {selected.state === "ready" && (
                  <>
                    <Text style={s.label}>Qui peut voir cette vidéo ?</Text>
                    <Button label="Tous mes élèves actuels" secondary onPress={()=>setGrants(students.map(student=>student.id))}/>
                    <Text style={s.caption}>La vidéo reste privée jusqu’à l’enregistrement des accès.</Text>
                    {students.length === 0 && (
                      <Text style={s.muted}>
                        Aucun élève lié à votre compte.
                      </Text>
                    )}
                    {students.map((st) => (
                      <Pressable
                        key={st.id}
                        onPress={() =>
                          setGrants((prev) =>
                            prev.includes(st.id)
                              ? prev.filter((id) => id !== st.id)
                              : [...prev, st.id],
                          )
                        }
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: grants.includes(st.id) }}
                        style={[s.row, { paddingVertical: 7 }]}
                      >
                        <Icon
                          name={
                            grants.includes(st.id)
                              ? "checkbox"
                              : "square-outline"
                          }
                          color={colors.wine}
                        />
                        <Text style={s.body}>{st.name}</Text>
                      </Pressable>
                    ))}
                    <Button
                      label="Partager avec ces élèves"
                      onPress={() => void save(true)}
                      disabled={!grants.length}
                      busy={busy}
                    />
                    <Button
                      label="Arrêter le partage"
                      secondary
                      onPress={() => void save(false)}
                      busy={busy}
                    />
                  </>
                )}
                <Button
                  label="Supprimer"
                  danger
                  onPress={confirmDelete}
                  busy={busy}
                />
              </>
            )}
          </View>
        )}
      </Sheet>
    </>
  );
}
