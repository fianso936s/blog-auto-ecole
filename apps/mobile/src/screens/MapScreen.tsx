import { syncAll } from "../services/sync";
import {
  directoryCenters,
  NO_CENTER,
  normalizeSearch,
} from "../services/route-directory";
import { ModalFrame } from "../components/ModalFrame";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Pressable, Text, View, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Library } from "./Library";
import * as Haptics from "expo-haptics";
import {
  categories,
  formatDistance,
  formatDuration,
  routeDuration,
  type Point,
  type MapSpot,
  type NativeLocation,
} from "@repere/core";
import { RouteMap } from "../components/RouteMap";
import {
  Button,
  Chip,
  Empty,
  Icon,
  IconButton,
  Field,
  Sheet,
} from "../components/UI";
import {
  PointEditor,
  PointReader,
  PointDetails,
} from "../components/PointEditor";
import { useApp } from "../state";
import { colors, styles as s } from "../theme";
import {
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  locate,
} from "../services/recorder";
import {
  duration,
  updateLocal,
  getLocal,
  putLocalRoute,
  routeInput,
  removeLocal,
} from "../services/local";
import { Replay } from "./Replay";
import { discoverPoints } from "../services/discovery";
export function MapScreen() {
  const insets = useSafeAreaInsets();
  const app = useApp();
  const threeD = app.mapThreeD;
  const setThreeD = app.setMapThreeD;
  const [routesOpen, setRoutesOpen] = useState(false);
  const centers = useMemo(
    () =>
      directoryCenters([...app.routes, ...app.locals]).filter(
        (c) => c !== NO_CENTER,
      ),
    [app.routes, app.locals],
  );
  const [examCenter, setExamCenter] = useState("");
  const [starting, setStarting] = useState(false),
    [busy, setBusy] = useState(false),
    [location, setLocation] = useState<NativeLocation | null>(null),
    [target, setTarget] =
      useState<React.ComponentProps<typeof PointEditor>["target"]>(null),
    [read, setRead] = useState<Point | MapSpot | null>(null),
    [saveId, setSaveId] = useState<string | null>(null),
    [name, setName] = useState(""),
    [replay, setReplay] = useState(false),
    [followKey, setFollowKey] = useState(0);
  const [locatedRoute, setLocatedRoute] = useState<
    typeof app.selected | undefined
  >(undefined);
  const [placing, setPlacing] = useState(false);
  const [category, setCategory] = useState("Tous");
  const [query, setQuery] = useState("");
  const [discovery, setDiscovery] = useState(false);
  const [discovered, setDiscovered] = useState<Point | MapSpot | null>(null);
  useEffect(() => {
    if (read && app.archivedPointIds.includes(read.id)) setRead(null);
    if (discovered && app.archivedPointIds.includes(discovered.id))
      setDiscovered(null);
  }, [app.archivedPointIds, read?.id, discovered?.id]);
  const teacher = app.profile?.role !== "student";
  const chosen = app.selected;
  const local = chosen ? app.locals.find((r) => r.id === chosen.id) : null;
  const active = app.active;
  const current = active || local;
  const fixes = current?.fixes || chosen?.fixes || [];
  const points = current?.points || chosen?.points || [];
  const visiblePoints = useMemo(() => {
    const hidden = new Set(app.archivedPointIds);
    return discoverPoints(app.spots, points, query, category).filter(
      (p) => !hidden.has(p.id),
    );
  }, [app.spots, app.archivedPointIds, points, query, category]);
  const position = active?.lastPosition || location;
  const state = active?.state;
  const own =
    !!chosen &&
    (chosen.authorId === app.profile?.id || app.profile?.role === "admin");
  const showError = (e: unknown) =>
    app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  async function start() {
    if (!app.profile) return;
    setStarting(true);
    app.select(null);
    try {
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
        if (r.fixes.length >= 2) {
          setName(r.name);
          setSaveId(r.id);
        } else
          app.setMessage(
            "Enregistrement arrêté. Aucun trajet exploitable : attendez une précision GPS suffisante au prochain essai.",
          );
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
    try {
      setLocation(await locate());
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
  function tap(p: { lat: number; lng: number }) {
    if (placing) addPoint(p);
  }
  function openPoint(point: Point | MapSpot) {
    if (
      teacher &&
      (("authorId" in point
        ? point.authorId === app.profile?.id
        : !!active || own) ||
        app.profile?.role === "admin")
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
  const gpsLabel = !position
    ? "GPS en attente"
    : age > 20000
      ? "Signal GPS interrompu"
      : position.accuracy === null
        ? "Précision inconnue"
        : `GPS ± ${Math.round(position.accuracy)} m`;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <RouteMap
          threeD={threeD}
          fixes={fixes}
          routeKey={active?.id || chosen?.id}
          points={active ? discoverPoints(app.spots, points) : visiblePoints}
          position={position}
          styleUrl={app.config?.mapStyleUrl}
          onTap={tap}
          onLongPress={teacher ? addPoint : undefined}
          viewportPadding={{ top: 220, bottom: 210, left: 35, right: 35 }}
          onPoint={openPoint}
          follow={!!active || (!!location && locatedRoute === app.selected)}
          recenterKey={followKey}
        />
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 10,
          left: 14,
          right: 14,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les parcours et filtrer par centre d’examen"
            onPress={() => setRoutesOpen(true)}
            style={({ pressed }) => [
              s.card,
              {
                flex: 1,
                padding: 13,
                gap: 3,
                opacity: pressed ? 0.8 : 1,
                borderRadius: 16,
              },
            ]}
          >
            <View style={s.between}>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}
              >
                Les parcours
              </Text>
              <Icon name="chevron-down" size={17} />
            </View>
            <Text numberOfLines={1} style={s.caption}>
              {active
                ? "Enregistrement en cours"
                : chosen?.name || "Choisir un centre d’examen"}
            </Text>
          </Pressable>
          <IconButton
            name="search-outline"
            label="Rechercher et filtrer les repères"
            onPress={() => setDiscovery(true)}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Chip
              label="2D"
              active={!threeD}
              onPress={() => setThreeD(false)}
            />
            <Chip label="3D" active={threeD} onPress={() => setThreeD(true)} />
          </View>
          <IconButton
            name="locate-outline"
            label="Me localiser et recentrer la carte"
            onPress={() => void locateMe()}
          />
        </View>
        {placing && (
          <View
            style={[s.card, { padding: 12, backgroundColor: colors.blueSoft }]}
          >
            <Text
              accessibilityRole="alert"
              style={[s.body, { fontSize: 14, color: colors.blue }]}
            >
              Touchez la carte pour placer votre repère.
            </Text>
          </View>
        )}
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          bottom: 14,
          left: 14,
          right: 14,
          gap: 10,
        }}
      >
        {teacher && (
          <View style={{ alignItems: "flex-end" }}>
            <IconButton
              name={placing ? "close" : "add"}
              label={
                placing
                  ? "Annuler l’ajout du repère"
                  : "Ajouter un repère sur la carte"
              }
              onPress={() => setPlacing((v) => !v)}
            />
          </View>
        )}
        <View
          style={[
            s.card,
            {
              padding: 14,
              borderRadius: 22,
              gap: 10,
              shadowColor: "#20131A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            },
          ]}
        >
          {active || starting ? (
            <>
              <View style={s.between}>
                <Text
                  style={[
                    s.caption,
                    {
                      color: state === "paused" ? colors.amber : colors.red,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {state === "paused" ? "EN PAUSE" : "● ENREGISTREMENT"}
                </Text>
                <Text
                  style={[
                    s.caption,
                    { color: age > 20000 ? colors.red : colors.green },
                  ]}
                >
                  {gpsLabel}
                </Text>
              </View>
              <Text style={[s.heading, { fontVariant: ["tabular-nums"] }]}>
                {formatDuration(active ? duration(active) : 0)} ·{" "}
                {formatDistance(active?.distance || 0)} ·{" "}
                {active?.points.length || 0} repères
              </Text>
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
                        void (
                          state === "paused"
                            ? resumeRecording(active.id)
                            : pauseRecording(active.id)
                        )
                          .then(app.reloadLocal)
                          .catch(showError);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    compact
                    danger
                    label="Terminer"
                    icon="stop"
                    busy={busy}
                    disabled={starting || !active}
                    onPress={() => void stop()}
                  />
                </View>
              </View>
              {!!active?.error && <Text style={s.caption}>{active.error}</Text>}
            </>
          ) : chosen ? (
            <>
              <View style={s.between}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text numberOfLines={1} style={[s.heading, { fontSize: 17 }]}>
                    {chosen.name}
                  </Text>
                  <Text style={s.caption}>
                    {chosen.examCenter || "Centre à renseigner"} ·{" "}
                    {formatDistance(chosen.distance)} · {points.length} repères
                  </Text>
                </View>
                <IconButton
                  name="close"
                  label="Fermer le parcours"
                  onPress={() => app.select(null)}
                />
              </View>
              <Button
                compact
                label="Revoir le parcours"
                icon="play-circle-outline"
                onPress={() => setReplay(true)}
              />
            </>
          ) : teacher ? (
            <Button
              label="Enregistrer un parcours"
              icon="radio-button-on"
              onPress={() => void start()}
              busy={starting}
            />
          ) : (
            <Button
              label="Choisir un parcours"
              icon="trail-sign-outline"
              onPress={() => setRoutesOpen(true)}
            />
          )}
        </View>
      </View>
      <Modal
        visible={routesOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setRoutesOpen(false)}
      >
        <ModalFrame>
          <View
            style={[s.between, { paddingHorizontal: 18, paddingVertical: 8 }]}
          >
            <Text numberOfLines={1} style={[s.heading, { flex: 1 }]}>
              Parcours par centre
            </Text>
            <IconButton
              name="close"
              label="Revenir à la carte"
              onPress={() => setRoutesOpen(false)}
            />
          </View>
          <Library onMap={() => setRoutesOpen(false)} />
        </ModalFrame>
      </Modal>
      <Sheet
        visible={discovery}
        title={discovered?.name || "Trouver un repère"}
        onClose={() => {
          setDiscovery(false);
          setDiscovered(null);
        }}
      >
        {discovered ? (
          <>
            <Button
              label="Revenir aux résultats"
              secondary
              icon="arrow-back"
              onPress={() => setDiscovered(null)}
            />
            <PointDetails point={discovered} />
          </>
        ) : (
          <>
            <Field
              label="Rechercher par nom ou situation"
              placeholder="Priorité, giratoire, rue…"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              returnKeyType="search"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {["Tous", ...categories].map((value) => (
                <Chip
                  key={value}
                  label={value}
                  active={category === value}
                  onPress={() => setCategory(value)}
                />
              ))}
            </ScrollView>
            <Text style={s.muted}>
              {visiblePoints.length} repère
              {visiblePoints.length === 1 ? "" : "s"} disponible
              {visiblePoints.length === 1 ? "" : "s"}
            </Text>
            {visiblePoints.length === 0 ? (
              <Empty
                title="Aucun repère trouvé"
                description="Essayez un autre nom ou élargissez les filtres."
                action={
                  <Button
                    secondary
                    label="Effacer les filtres"
                    onPress={() => {
                      setQuery("");
                      setCategory("Tous");
                    }}
                  />
                }
              />
            ) : (
              visiblePoints.map((point) => (
                <Pressable
                  key={point.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvrir ${point.name}, ${point.category}`}
                  onPress={() => setDiscovered(point)}
                  style={({ pressed }) => [
                    s.card,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <View style={s.between}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text style={s.eyebrow}>{point.category}</Text>
                      <Text style={s.heading}>{point.name}</Text>
                    </View>
                    <Icon name="chevron-forward" />
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}
      </Sheet>
      <PointEditor target={target} onClose={() => setTarget(null)} />
      <PointReader point={read} onClose={() => setRead(null)} />
      <Sheet
        visible={!!saveId}
        onClose={() => {
          setSaveId(null);
          void app.sync();
        }}
        title="Votre parcours est enregistré"
      >
        <Text style={s.subtitle}>
          Nommez votre parcours et choisissez son centre. Vous pourrez ensuite
          le publier pour les élèves.
        </Text>
        <Field
          label="Nom du parcours"
          value={name}
          onChangeText={setName}
          maxLength={120}
        />
        <Field
          label="Centre d’examen"
          value={examCenter}
          onChangeText={setExamCenter}
          placeholder="Ex. Nanterre ou Gennevilliers"
          maxLength={100}
        />
        {!!centers.length && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {centers.map((c) => (
              <Chip
                key={c}
                label={c}
                tone="blue"
                active={normalizeSearch(examCenter) === normalizeSearch(c)}
                onPress={() => setExamCenter(c)}
              />
            ))}
          </ScrollView>
        )}
        <Button
          label="Enregistrer le parcours"
          icon="cloud-upload-outline"
          onPress={async () => {
            if (saveId && name.trim()) {
              await updateLocal(saveId, {
                name: name.trim(),
                examCenter: examCenter.trim(),
              });
              await app.reloadLocal();
              try {
                const result = await syncAll(app.profile!.id);
                if (result.errors.length) throw new Error(result.errors[0]);
                await app.refresh();
                setSaveId(null);
                app.setMessage(
                  "Parcours enregistré. Ouvrez Les parcours pour le publier.",
                );
              } catch (e) {
                showError(e);
              }
            }
          }}
        />
      </Sheet>
      {chosen && (
        <Replay
          route={chosen}
          visible={replay}
          onClose={() => setReplay(false)}
        />
      )}
    </View>
  );
}
