import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  categories,
  formatDistance,
  formatDuration,
  replayAnchor,
  type MapSpot,
  type NativeLocation,
  type Point,
  type Route,
} from "@repere/core";
import { syncAll } from "../services/sync";
import { ModalFrame } from "../components/ModalFrame";
import { Library, RouteEditorSheet, useRouteTools } from "./Library";
import { RouteMap } from "../components/RouteMap";
import { Badge, Button, Dropdown, Icon, IconButton, LinkButton } from "../components/UI";
import { PointEditor, PointReader } from "../components/PointEditor";
import { useApp } from "../state";
import { colors, fonts, radius, shadow, styles as s, tones, filterTone } from "../theme";
import {
  locate,
  pauseRecording,
  resumeRecording,
  startRecording,
  stopRecording,
} from "../services/recorder";
import { duration, getLocal, updateLocal } from "../services/local";
import { request } from "../services/auth";
import { Replay } from "./Replay";
import { discoverPoints } from "../services/discovery";

/** A map tool, like the website's .map-tool (translucent square with a shadow). */
function Tool({ label, onPress, children, active = false, disabled = false }: { label: string; onPress: () => void; children: React.ReactNode; active?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        {
          minWidth: 44,
          height: 44,
          paddingHorizontal: 10,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: "rgba(255,253,250,0.96)",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        shadow.md,
      ]}
    >
      {children}
    </Pressable>
  );
}

/**
 * Mirrors the website's map page: title card and tools on top, the "Repères" filter,
 * the route panel / recording panel / "Ajouter un repère · Enregistrer" at the bottom,
 * and the "Les parcours" directory.
 */
export function MapScreen() {
  const insets = useSafeAreaInsets();
  const app = useApp();
  const tools = useRouteTools();
  const teacher = app.profile?.role !== "student";
  const threeD = app.mapThreeD;
  const [directory, setDirectory] = useState(app.profile?.role === "student");
  const [gpsFollow, setGpsFollow] = useState(false);
  const [cameraMode, setCameraMode] = useState<"pov" | "preview">("preview");
  const [starting, setStarting] = useState(false),
    [busy, setBusy] = useState(false),
    [syncing, setSyncing] = useState(false),
    [location, setLocation] = useState<NativeLocation | null>(null),
    [target, setTarget] = useState<React.ComponentProps<typeof PointEditor>["target"]>(null),
    [read, setRead] = useState<Point | MapSpot | null>(null),
    [saving, setSaving] = useState<{ id: string; summary: string; draft: Parameters<typeof RouteEditorSheet>[0]["initial"] } | null>(null),
    [replay, setReplay] = useState<false | "map" | "street">(false),
    [followKey, setFollowKey] = useState(0),
    [placing, setPlacing] = useState(false),
    [category, setCategory] = useState("Tous");
  const [locatedRoute, setLocatedRoute] = useState<typeof app.selected | undefined>(undefined);
  const center = useRef<(() => Promise<{ lat: number; lng: number } | null>) | null>(null);
  useEffect(() => {
    if (!gpsFollow || app.active) return;
    let alive = true,
      subscription: Location.LocationSubscription | undefined;
    void Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 3, timeInterval: 2000 },
      (p) => {
        if (p.coords.accuracy !== null && p.coords.accuracy > 100) return;
        setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, timestamp: p.timestamp });
      },
    )
      .then((sub) => {
        if (alive) subscription = sub;
        else sub.remove();
      })
      .catch(() => {
        setGpsFollow(false);
        app.setMessage("Autorisez la localisation pour le suivi automatique.");
      });
    return () => {
      alive = false;
      subscription?.remove();
    };
  }, [gpsFollow, !!app.active]);
  useEffect(() => {
    if (read && app.archivedPointIds.includes(read.id)) setRead(null);
  }, [app.archivedPointIds, read?.id]);
  const chosen = app.selected;
  const local = chosen ? app.locals.find((r) => r.id === chosen.id) : null;
  const active = app.active;
  const current = active || local;
  const fixes = current?.fixes || chosen?.fixes || [];
  const points = current?.points || chosen?.points || [];
  const visiblePoints = useMemo(() => {
    const hidden = new Set(app.archivedPointIds);
    return discoverPoints(app.spots, points, "", category).filter((p) => !hidden.has(p.id));
  }, [app.spots, app.archivedPointIds, points, category]);
  const position = active?.lastPosition || location;
  const state = active?.state;
  const own = !!chosen && tools.canEdit(chosen);
  const routeCount = useMemo(
    () => new Set([...app.routes.map((r) => r.id), ...app.locals.filter((r) => r.state === "finished" && r.fixes.length >= 2).map((r) => r.id)]).size,
    [app.routes, app.locals],
  );
  const showError = (e: unknown) => app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  async function synchronize() {
    if (!app.profile) return;
    setSyncing(true);
    try {
      const result = await syncAll(app.profile.id);
      await app.reloadLocal();
      await app.refresh();
      if (result.errors.length) throw new Error(result.errors[0]);
    } catch (e) {
      showError(e);
    } finally {
      setSyncing(false);
    }
  }
  async function start() {
    if (!app.profile) return;
    setStarting(true);
    setPlacing(false);
    app.select(null);
    try {
      setCameraMode("pov");
      await startRecording(app.profile.id);
      await app.reloadLocal();
    } catch (e) {
      showError(e);
    } finally {
      setStarting(false);
    }
  }
  async function stop() {
    setBusy(true);
    try {
      await stopRecording(active?.id);
      await app.reloadLocal();
      const r = active ? await getLocal(active.id) : null;
      if (r) {
        if (r.fixes.length >= 2)
          setSaving({
            id: r.id,
            summary: `${formatDistance(r.distance)} · ${r.fixes.length} positions GPS · ${r.points.length} repères`,
            draft: { name: r.name, description: r.description, difficulty: r.difficulty, examCenter: r.examCenter || "", status: r.status },
          });
        else
          app.setMessage("Enregistrement arrêté. Aucun trajet exploitable : attendez une précision GPS suffisante au prochain essai.");
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
      setStarting(false);
    }
  }
  async function locateMe() {
    if (gpsFollow) {
      setGpsFollow(false);
      return;
    }
    try {
      setLocation(await locate());
      setGpsFollow(true);
      setLocatedRoute(app.selected);
      setFollowKey((n) => n + 1);
    } catch (e) {
      showError(e);
    }
  }
  function addPoint(p: { lat: number; lng: number }) {
    if (!teacher) return;
    setPlacing(false);
    const routeId = active?.id || (own ? chosen?.id : undefined);
    setTarget({ ...p, routeId, fixes });
    void Haptics.selectionAsync();
  }
  function openPoint(point: Point | MapSpot) {
    if (
      teacher &&
      (("authorId" in point ? point.authorId === app.profile?.id : !!active || own) || app.profile?.role === "admin")
    )
      setTarget({
        lat: point.lat,
        lng: point.lng,
        point,
        routeId: "fixIndex" in point ? active?.id || chosen?.id : undefined,
        fixes,
      });
    else setRead(point);
  }
  const age = position ? Date.now() - position.timestamp : Infinity;
  const accuracy = !position
    ? "en attente"
    : age > 20000
      ? "signal interrompu"
      : position.accuracy === null
        ? "inconnue"
        : `± ${Math.round(position.accuracy)} m`;
  const recording = !!active || starting;
  const panel = [s.card, { padding: 16, gap: 12, borderRadius: radius.lg }, shadow.lg];
  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <RouteMap
          threeD={threeD}
          fixes={fixes}
          routeKey={active?.id || chosen?.id}
          points={active ? discoverPoints(app.spots, points) : visiblePoints}
          position={position}
          styleUrl={app.config?.mapStyleUrl}
          onTap={(p) => placing && addPoint(p)}
          onLongPress={teacher ? addPoint : undefined}
          viewportPadding={{ top: 170, bottom: 230, left: 35, right: 35 }}
          onPoint={openPoint}
          follow={(!!active && cameraMode === "pov") || (gpsFollow && !!location && locatedRoute === app.selected)}
          navigationMode={!!active && cameraMode === "pov"}
          previewMode={!!active && cameraMode === "preview"}
          recenterKey={followKey}
          centerHandle={center}
        />
      </View>
      {/* Top: title card + tools, then the "Repères" filter (website .map-top / .student-map-filter). */}
      <View pointerEvents="box-none" style={{ position: "absolute", top: insets.top + 12, left: 12, right: 12, gap: 10 }}>
        <View pointerEvents="box-none" style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          <View style={[{ flex: 1, minWidth: 0, minHeight: 44, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: "rgba(255,253,250,0.96)" }, shadow.md]}>
            <Text accessibilityRole="header" numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.4, color: colors.ink }}>
              Carte et parcours
            </Text>
          </View>
          <Tool label="Synchroniser les parcours et repères" onPress={() => void synchronize()} disabled={syncing}>
            <Icon name="refresh" size={18} color={colors.ink} />
          </Tool>
          <Tool label={threeD ? "Passer en 2D" : "Passer en 3D"} active={threeD} onPress={() => app.setMapThreeD(!threeD)}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink }}>{threeD ? "2D" : "3D"}</Text>
          </Tool>
          <Tool label={gpsFollow ? "Désactiver le suivi automatique" : "Me localiser et activer le suivi automatique"} active={gpsFollow} onPress={() => void locateMe()}>
            <Icon name={gpsFollow ? "locate" : "locate-outline"} size={19} color={gpsFollow ? colors.wine : colors.ink} />
          </Tool>
          <Tool label={`Les parcours, ${routeCount}`} onPress={() => setDirectory(true)}>
            <Icon name="map-outline" size={18} color={colors.ink} />
            <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: colors.wine }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.paper }}>{routeCount}</Text>
            </View>
          </Tool>
        </View>
        {!recording && (
          <View pointerEvents="box-none" style={{ flexDirection: "row" }}>
            <View style={{ width: 240 }}>
              <Dropdown
                inline
                label="Repères"
                value={category}
                options={["Tous", ...categories].map((c) => ({ id: c, label: c === "Tous" ? "Tous les repères" : c }))}
                onChange={setCategory}
              />
            </View>
          </View>
        )}
      </View>
      {/* Placement banner (website .map-placement). */}
      {placing && (
        <View style={[panel, { position: "absolute", left: 12, right: 12, bottom: 12 }]}>
          <Text accessibilityRole="alert" style={[s.body, { fontFamily: fonts.bodySemi }]}>Touchez la carte à l’endroit du repère</Text>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button
                compact
                secondary
                label="Utiliser le centre"
                icon="locate-outline"
                onPress={async () => {
                  const c = (await center.current?.()) || (position ? { lat: position.latitude, lng: position.longitude } : null);
                  if (c) addPoint(c);
                  else app.setMessage("Déplacez la carte puis réessayez.");
                }}
              />
            </View>
            <LinkButton label="Annuler" onPress={() => setPlacing(false)} />
          </View>
        </View>
      )}
      {/* Bottom: route panel, recording panel, creation buttons (website .map-bottom). */}
      {!placing && (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom: 12, gap: 10 }}>
          {chosen && !recording && (
            <View style={panel}>
              <View style={s.between}>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <Badge label={chosen.examCenter || "À classer"} />
                    {chosen.status === "published" && <Badge label="Visible par les élèves" tone="green" />}
                  </View>
                  <Text numberOfLines={2} style={[s.heading, { fontSize: 16 }]}>{chosen.name}</Text>
                </View>
                <IconButton name="close" label="Fermer le parcours" onPress={() => app.select(null)} />
              </View>
              <View style={[s.row, { gap: 12 }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Lire le parcours"
                  onPress={() => setReplay("map")}
                  style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.wine, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.94 : 1 }] }, shadow.wine]}
                >
                  <Icon name="play" size={20} color={colors.paper} />
                </Pressable>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.body, { fontFamily: fonts.bodySemi }]}>Lire le parcours</Text>
                  <Text style={s.caption}>
                    {formatDistance(chosen.distance)} · {chosen.fixes.length} positions · {points.length} repères
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 12 }}>
                {!!replayAnchor(chosen.fixes, 0) && (
                  <LinkButton label="Street View" icon="arrow-forward" onPress={() => setReplay("street")} />
                )}
                <LinkButton
                  label={chosen.favorite ? "Favori" : "Ajouter aux favoris"}
                  icon={chosen.favorite ? "star" : "star-outline"}
                  onPress={() => void tools.toggleFavorite(chosen)}
                />
                {own && (
                  <>
                    {chosen.status !== "published" ? (
                      <LinkButton label="Publier pour les élèves" disabled={tools.busyId === chosen.id} onPress={() => void tools.setPublished(chosen, true)} />
                    ) : (
                      <LinkButton label="Passer en privé" disabled={tools.busyId === chosen.id} onPress={() => void tools.setPublished(chosen, false)} />
                    )}
                    <LinkButton label="Modifier le parcours" onPress={() => tools.edit(chosen)} />
                    <LinkButton label="Attribuer" onPress={() => tools.assign(chosen)} />
                    <LinkButton label="Dupliquer" onPress={() => void tools.duplicate(chosen)} />
                  </>
                )}
                <LinkButton label="GPX" icon="download-outline" onPress={() => void tools.exportFile(chosen)} />
              </View>
              {points.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {points.map((p) => (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Ouvrir ${p.name}`}
                      onPress={() => openPoint(p)}
                      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 7, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: pressed ? colors.soft : colors.cream })}
                    >
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tones[filterTone(p.category)].ink }} />
                      <Text numberOfLines={1} style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: colors.ink, maxWidth: 180 }}>{p.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          {recording ? (
            <View style={panel}>
              <View style={s.row} accessibilityLabel="Mode d’affichage du trajet">
                <View style={{ flex: 1 }}>
                  <Button compact secondary={cameraMode !== "pov"} label="Vue GPS" icon="navigate" onPress={() => { setCameraMode("pov"); setFollowKey((n) => n + 1); }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button compact secondary={cameraMode !== "preview"} label="Aperçu complet" icon="map-outline" onPress={() => setCameraMode("preview")} />
                </View>
              </View>
              <View style={s.between}>
                <View style={[s.row, { gap: 8 }]}>
                  {state !== "paused" && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red }} />}
                  <Text style={[s.body, { fontFamily: fonts.bodyBold }]}>{state === "paused" ? "En pause" : "Enregistrement GPS"}</Text>
                </View>
                <Text style={[s.body, { fontFamily: fonts.bodyBold, fontVariant: ["tabular-nums"] }]}>{formatDuration(active ? duration(active) : 0)}</Text>
              </View>
              <View style={s.between}>
                <Text style={s.caption}>
                  {formatDistance(active?.distance || 0)} · {active?.fixes.length || 0} positions
                </Text>
                <Text style={[s.caption, { color: age > 20000 ? colors.red : colors.muted }]}>Précision {accuracy}</Text>
              </View>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Button
                    compact
                    secondary
                    label={state === "paused" ? "Reprendre" : "Pause"}
                    icon={state === "paused" ? "play" : "pause"}
                    disabled={!active || busy}
                    onPress={() => {
                      if (active)
                        void (state === "paused" ? resumeRecording(active.id) : pauseRecording(active.id))
                          .then(app.reloadLocal)
                          .catch(showError);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button compact label="Terminer" icon="checkmark" busy={busy} disabled={starting || !active} onPress={() => void stop()} />
                </View>
                <IconButton
                  name="add"
                  label="Ajouter un repère ici"
                  onPress={() => {
                    if (position) addPoint({ lat: position.latitude, lng: position.longitude });
                    else setPlacing(true);
                  }}
                />
              </View>
              <Text style={s.caption}>
                {active?.error || "L’enregistrement continue écran verrouillé. Gardez la localisation autorisée « Toujours »."}
              </Text>
            </View>
          ) : (
            teacher && (
              <View pointerEvents="box-none" style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Button label="Ajouter un repère" icon="add" onPress={() => setPlacing(true)} />
                <Button label="Enregistrer" secondary icon="locate-outline" busy={starting} onPress={() => void start()} />
              </View>
            )
          )}
        </View>
      )}
      <Modal visible={directory} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDirectory(false)}>
        <ModalFrame>
          <View style={[s.between, { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderColor: colors.line }]}>
            <Text accessibilityRole="header" style={[s.heading, { flex: 1 }]}>Les parcours</Text>
            <IconButton name="close" label="Revenir à la carte" onPress={() => setDirectory(false)} />
          </View>
          <Library onMap={() => setDirectory(false)} />
        </ModalFrame>
      </Modal>
      <PointEditor target={target} onClose={() => setTarget(null)} />
      <PointReader point={read} onClose={() => setRead(null)} />
      <RouteEditorSheet
        initial={saving?.draft ?? null}
        summary={saving?.summary}
        onClose={() => {
          setSaving(null);
          void app.sync();
        }}
        onSave={async (draft) => {
          if (!saving || !app.profile) return;
          await updateLocal(saving.id, draft);
          await app.reloadLocal();
          const result = await syncAll(app.profile.id);
          if (result.errors.length) throw new Error(result.errors[0]);
          await app.refresh();
          const saved = await request<Route>(`/v1/routes/${saving.id}`).catch(() => null);
          if (saved) app.select(saved);
          setSaving(null);
          app.setMessage("Parcours enregistré dans votre espace.");
        }}
      />
      {tools.sheets}
      {chosen && <Replay route={chosen} visible={!!replay} initialMode={replay || "map"} onClose={() => setReplay(false)} />}
    </View>
  );
}
