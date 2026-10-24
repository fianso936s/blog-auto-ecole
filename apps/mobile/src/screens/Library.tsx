import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import * as Haptics from "expo-haptics";
import { File, Paths } from "expo-file-system";
import {
  difficulties,
  exportGpx,
  importGpx,
  formatDistance,
  type Route,
  type RouteSummary,
  type RouteInput,
} from "@repere/core";
import { useApp } from "../state";
import { colors, fonts, radius, styles as s } from "../theme";
import {
  Badge,
  Button,
  Chip,
  Dropdown,
  Empty,
  Field,
  Icon,
  Sheet,
} from "../components/UI";
import { request } from "../services/auth";
import { syncAll, localSummary } from "../services/sync";
import {
  directoryCenters,
  pickableCenters,
  NO_CENTER,
  matchesRoute,
} from "../services/route-directory";
import {
  putLocalRoute,
  routeInput,
  updateLocal,
  removeLocal,
  getLocal,
} from "../services/local";

/** Any route the panel or the directory can act on (summary or full detail). */
export type RouteLike = Omit<Route, "fixes" | "points">;
type Draft = Pick<RouteInput, "name" | "description" | "difficulty" | "examCenter" | "status">;

/** Same form as the website's RouteEditor: "Enregistrer et publier le parcours". */
export function RouteEditorSheet({
  initial,
  summary,
  onSave,
  onDelete,
  onClose,
}: {
  initial: Draft | null;
  summary?: string;
  onSave: (draft: Draft) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(initial);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const key = initial ? `${initial.name}|${initial.examCenter}|${initial.status}` : "";
  const [seen, setSeen] = useState(key);
  if (seen !== key) {
    setSeen(key);
    setDraft(initial);
    setError("");
  }
  const centers = useMemo(
    () => [...new Set([...pickableCenters([]), ...(draft?.examCenter ? [draft.examCenter] : [])])],
    [draft?.examCenter],
  );
  const published = draft?.status === "published";
  return (
    <Sheet visible={!!initial} title="Enregistrer et publier le parcours" onClose={onClose}>
      {draft && (
        <>
          {!!summary && <Text style={s.muted}>{summary}</Text>}
          <Field
            label="Nom du parcours"
            value={draft.name}
            onChangeText={(name) => setDraft({ ...draft, name })}
            maxLength={120}
          />
          <Dropdown
            label="Centre d’examen"
            value={draft.examCenter || ""}
            options={[{ id: "", label: "À classer" }, ...centers.map((c) => ({ id: c, label: c }))]}
            onChange={(examCenter) => setDraft({ ...draft, examCenter })}
          />
          <Field
            label="Description"
            multiline
            value={draft.description}
            onChangeText={(description) => setDraft({ ...draft, description })}
            maxLength={3000}
          />
          <Dropdown
            label="Difficulté"
            value={draft.difficulty}
            options={difficulties.map((d) => ({ id: d, label: d }))}
            onChange={(difficulty) => setDraft({ ...draft, difficulty })}
          />
          <View style={[s.between, { minHeight: 48 }]}>
            <Text style={[s.body, { flex: 1, fontFamily: fonts.bodySemi }]}>Publier · visible par les élèves</Text>
            <Switch
              value={published}
              onValueChange={(on) => setDraft({ ...draft, status: on ? "published" : "private" })}
              trackColor={{ true: colors.wine, false: colors.line }}
              accessibilityLabel="Publier · visible par les élèves"
            />
          </View>
          <Text style={s.caption}>
            Un parcours privé est visible par son auteur, l’administrateur et les élèves auxquels il est attribué.
          </Text>
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
          <Button
            icon="checkmark"
            busy={busy}
            disabled={!draft.name.trim()}
            label={published ? "Enregistrer et publier" : "Enregistrer en privé"}
            onPress={async () => {
              setBusy(true);
              setError("");
              try {
                await onSave({ ...draft, name: draft.name.trim(), examCenter: (draft.examCenter || "").trim() });
              } catch (e) {
                setError(e instanceof Error ? e.message : "Enregistrement impossible.");
              } finally {
                setBusy(false);
              }
            }}
          />
          {onDelete && (
            <View style={{ paddingTop: 8, gap: 6, borderTopWidth: 1, borderColor: colors.line }}>
              <Button
                secondary
                danger
                compact
                icon="trash-outline"
                label="Supprimer ce parcours"
                onPress={() =>
                  Alert.alert(
                    "Supprimer ce parcours ?",
                    "Ce parcours, ses repères associés et ses attributions seront supprimés pour tous les appareils.",
                    [
                      { text: "Annuler", style: "cancel" },
                      { text: "Supprimer", style: "destructive", onPress: onDelete },
                    ],
                  )
                }
              />
            </View>
          )}
        </>
      )}
    </Sheet>
  );
}

/** Same as the website's Assignments modal for a route: "Attribuer ce parcours". */
function AssignSheet({ routeId, onClose }: { routeId: string | null; onClose: () => void }) {
  const app = useApp();
  const [students, setStudents] = useState<{ id: string; name: string; email: string; role?: string }[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    if (!routeId) return;
    let alive = true;
    setBusy(true);
    setError("");
    setStudents([]);
    void Promise.all([
      request<{ students: typeof students }>("/v1/students"),
      request<{ students: string[] }>(`/v1/routes/${routeId}/assignments`),
    ])
      .then(([users, links]) => {
        if (!alive) return;
        setStudents(users.students.filter((p) => p.role === undefined || p.role === "student"));
        setSelected(links.students);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Chargement impossible."))
      .finally(() => alive && setBusy(false));
    return () => {
      alive = false;
    };
  }, [routeId]);
  return (
    <Sheet visible={!!routeId} title="Attribuer ce parcours" onClose={onClose}>
      <Text style={s.muted}>Choisissez les élèves autorisés.</Text>
      {students.map((student) => {
        const on = selected.includes(student.id);
        return (
          <Pressable
            key={student.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: on }}
            onPress={() => {
              void Haptics.selectionAsync();
              setSelected((a) => (on ? a.filter((id) => id !== student.id) : [...a, student.id]));
            }}
            style={({ pressed }) => [s.card, { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: pressed ? colors.cream : colors.paper }]}
          >
            <Icon name={on ? "checkbox" : "square-outline"} size={22} />
            <View style={{ flex: 1 }}>
              <Text style={[s.body, { fontFamily: fonts.bodySemi }]}>{student.name}</Text>
              <Text style={s.caption}>{student.email}</Text>
            </View>
          </Pressable>
        );
      })}
      {!busy && !students.length && !error && (
        <Empty title="Aucun élève lié" description="Créez une invitation depuis Mon espace." />
      )}
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        label="Enregistrer les accès"
        busy={busy && !!students.length}
        disabled={busy || !!error}
        onPress={async () => {
          setBusy(true);
          try {
            await request(`/v1/routes/${routeId}/assignments`, {
              method: "PUT",
              body: JSON.stringify({ students: selected }),
            });
            app.setMessage("Accès enregistrés.");
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Enregistrement impossible.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </Sheet>
  );
}

/**
 * Every route action of the website (open, publish, private, edit, assign, duplicate,
 * GPX import/export, favourite, delete), shared by the map panel and the directory.
 * Works offline first: changes go to the iPhone, then sync.
 */
export function useRouteTools() {
  const app = useApp();
  const [busyId, setBusyId] = useState<string | null>(null),
    [editing, setEditing] = useState<RouteLike | null>(null),
    [assignId, setAssignId] = useState<string | null>(null);
  const error = (e: unknown) =>
    app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  const canEdit = (r: RouteLike) =>
    app.profile?.role !== "student" &&
    (r.authorId === app.profile?.id || app.profile?.role === "admin");
  async function fetchRoute(r: RouteLike): Promise<Route> {
    const local = app.locals.find((l) => l.id === r.id);
    if (local && (local.syncedRevision !== local.revision || local.state !== "finished"))
      return {
        ...routeInput(local),
        authorId: local.userId,
        authorName: "Vous",
        createdAt: local.createdAt,
        updatedAt: local.updatedAt,
        distance: local.distance,
        favorite: r.favorite,
        progress: 0,
      } as Route;
    return request<Route>(`/v1/routes/${r.id}`);
  }
  async function localize(r: RouteLike) {
    if (!app.profile) return null;
    return (await getLocal(r.id)) || putLocalRoute(app.profile.id, await fetchRoute(r));
  }
  async function push() {
    const result = await syncAll(app.profile!.id);
    if (result.errors.length) throw new Error(result.errors[0]);
    await app.reloadLocal();
    await app.refresh();
  }
  async function open(r: RouteLike, then?: () => void) {
    setBusyId(r.id);
    try {
      if (app.active && app.active.id !== r.id)
        throw new Error("Terminez l’enregistrement en cours pour ouvrir ce parcours.");
      app.select(await fetchRoute(r));
      then?.();
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  async function importFile(then?: () => void) {
    if (!app.profile) return;
    try {
      if (app.active)
        throw new Error("Terminez l’enregistrement en cours avant d’importer un parcours.");
      const pick = await DocumentPicker.getDocumentAsync({
        type: ["application/gpx+xml", "application/xml", "text/xml", "application/octet-stream"],
        copyToCacheDirectory: true,
      });
      if (pick.canceled) return;
      const asset = pick.assets[0]!;
      if (asset.size && asset.size > 12 * 1024 * 1024)
        throw new Error("Le fichier GPX est trop volumineux.");
      const input = importGpx(await new File(asset.uri).text(), Crypto.randomUUID());
      const imported = await putLocalRoute(app.profile.id, input);
      await app.reloadLocal();
      app.select({
        ...routeInput(imported),
        authorId: imported.userId,
        authorName: "Vous",
        createdAt: imported.createdAt,
        updatedAt: imported.updatedAt,
        distance: imported.distance,
        favorite: false,
        progress: 0,
      });
      then?.();
      setEditing({ ...localSummary(imported), authorId: imported.userId, favorite: false } as RouteLike);
    } catch (e) {
      error(e);
    }
  }
  async function exportFile(r: RouteLike) {
    try {
      const f = new File(Paths.cache, `parcours-${r.id.slice(0, 8)}.gpx`);
      f.write(exportGpx(await fetchRoute(r)));
      if (!(await Sharing.isAvailableAsync()))
        throw new Error("Le partage est indisponible sur cet appareil.");
      await Sharing.shareAsync(f.uri, { mimeType: "application/gpx+xml", UTI: "com.topografix.gpx" });
    } catch (e) {
      error(e);
    }
  }
  async function toggleFavorite(r: RouteLike) {
    try {
      await request(`/v1/routes/${r.id}/favorite`, {
        method: "POST",
        body: JSON.stringify({ active: !r.favorite }),
      });
      void Haptics.selectionAsync();
      if (app.selected?.id === r.id) app.select({ ...app.selected, favorite: !r.favorite });
      await app.refresh();
    } catch (e) {
      error(e);
    }
  }
  async function duplicate(r: RouteLike) {
    try {
      const detail = await fetchRoute(r);
      await putLocalRoute(app.profile!.id, {
        ...detail,
        id: Crypto.randomUUID(),
        version: 0,
        status: "private" as const,
        name: `${detail.name.slice(0, 100)} — copie`,
        points: detail.points.map((p) => ({
          ...p,
          id: Crypto.randomUUID(),
          validated: p.answer !== undefined && !!p.explanation,
          photos: p.photos.map((ph) => ({ ...ph, id: Crypto.randomUUID() })),
        })),
      });
      await app.reloadLocal();
      void app.sync();
      app.setMessage("Parcours dupliqué.");
    } catch (e) {
      error(e);
    }
  }
  /** Website: "Publier pour les élèves" / "Passer en privé" (private also removes student access). */
  async function setPublished(r: RouteLike, publish: boolean) {
    if (!app.profile) return;
    setBusyId(r.id);
    try {
      const local = await localize(r);
      if (!local || local.state !== "finished")
        throw new Error("Terminez l’enregistrement avant de publier.");
      if (!publish && r.version > 0)
        await request(`/v1/routes/${r.id}/assignments`, {
          method: "PUT",
          body: JSON.stringify({ students: [] }),
        });
      await updateLocal(r.id, { status: publish ? "published" : "private" });
      await push();
      const verified = await request<Route>(`/v1/routes/${r.id}`);
      if (verified.status !== (publish ? "published" : "private"))
        throw new Error("La publication n’a pas été confirmée. Réessayez.");
      if (app.selected?.id === r.id) app.select(verified);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      app.setMessage(
        publish
          ? "Parcours publié : les élèves peuvent le sélectionner."
          : "Parcours passé en privé : accès élèves retiré.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  async function remove(r: RouteLike) {
    try {
      if (r.version > 0) await request(`/v1/routes/${r.id}`, { method: "DELETE" });
      await removeLocal(r.id);
      if (app.selected?.id === r.id) app.select(null);
      setEditing(null);
      await app.refresh();
      await app.reloadLocal();
      app.setMessage("Parcours supprimé.");
    } catch (e) {
      error(e);
    }
  }
  async function save(r: RouteLike, draft: Draft) {
    await localize(r);
    await updateLocal(r.id, draft);
    await app.reloadLocal();
    await push();
    if (app.selected?.id === r.id) {
      const fresh = await fetchRoute({ ...r, ...draft }).catch(() => null);
      if (fresh) app.select(fresh);
    }
    setEditing(null);
    app.setMessage("Parcours enregistré dans votre espace.");
  }
  const sheets = (
    <>
      <RouteEditorSheet
        initial={
          editing && {
            name: editing.name,
            description: editing.description,
            difficulty: editing.difficulty,
            examCenter: editing.examCenter || "",
            status: editing.status,
          }
        }
        onSave={(draft) => save(editing!, draft)}
        onDelete={editing && canEdit(editing) ? () => void remove(editing) : undefined}
        onClose={() => setEditing(null)}
      />
      <AssignSheet routeId={assignId} onClose={() => setAssignId(null)} />
    </>
  );
  return {
    busyId,
    canEdit,
    open,
    importFile,
    exportFile,
    toggleFavorite,
    duplicate,
    setPublished,
    edit: (r: RouteLike) => setEditing(r),
    assign: (r: RouteLike) => {
      if (r.version === 0) app.setMessage("Synchronisez d’abord ce parcours.");
      else setAssignId(r.id);
    },
    sheets,
  };
}

/** The website's "Les parcours" directory: search, centre, difficulty, favourites, route cards. */
export function Library({ onMap }: { onMap: () => void }) {
  const app = useApp();
  const tools = useRouteTools();
  const [search, setSearch] = useState(""),
    [difficulty, setDifficulty] = useState("Tous"),
    [center, setCenter] = useState("Tous les centres"),
    [favorites, setFavorites] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  const teacher = app.profile?.role !== "student";
  const allRoutes = useMemo(() => {
    const map = new Map(app.routes.map((r) => [r.id, r]));
    for (const r of app.locals.filter((r) => r.state !== "finished" || r.fixes.length >= 2))
      if (!map.has(r.id) || r.state !== "finished" || r.syncedRevision !== r.revision)
        map.set(r.id, {
          ...localSummary(r),
          authorId: map.get(r.id)?.authorId || r.userId,
          authorName: map.get(r.id)?.authorName || "Vous",
          favorite: map.get(r.id)?.favorite || false,
        });
    return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [app.routes, app.locals]);
  const centers = useMemo(
    () => [
      ...pickableCenters(allRoutes),
      ...(directoryCenters(allRoutes).includes(NO_CENTER) ? [NO_CENTER] : []),
    ],
    [allRoutes],
  );
  const visible = useMemo(
    () =>
      allRoutes.filter((r) =>
        matchesRoute(r, { search, center, difficulty, category: "Toutes", favorites }),
      ),
    [allRoutes, search, center, difficulty, favorites],
  );
  async function synchronize() {
    setRefreshing(true);
    try {
      const result = await syncAll(app.profile!.id);
      await app.reloadLocal();
      await app.refresh();
      if (result.errors.length) throw new Error(result.errors[0]);
    } catch (e) {
      app.setMessage(e instanceof Error ? e.message : "Synchronisation impossible.");
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <>
      <ScrollView
        contentContainerStyle={[s.content, { gap: 14 }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} tintColor={colors.wine} onRefresh={() => void synchronize()} />
        }
      >
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <View style={[s.field, { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 0 }]}>
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un parcours…"
              placeholderTextColor={colors.muted}
              selectionColor={colors.wine}
              accessibilityLabel="Rechercher un parcours"
              returnKeyType="search"
              autoCorrect={false}
              style={{ flex: 1, minHeight: 50, fontFamily: fonts.body, fontSize: 16, color: colors.ink }}
            />
          </View>
        </View>
        {teacher && (
          <Button compact secondary icon="add" label="Importer GPX" onPress={() => void tools.importFile(onMap)} />
        )}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Dropdown
              label="Centre d’examen"
              value={center}
              options={["Tous les centres", ...centers].map((c) => ({ id: c, label: c }))}
              onChange={setCenter}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              label="Difficulté"
              value={difficulty}
              options={["Tous", ...difficulties].map((d) => ({ id: d, label: d }))}
              onChange={setDifficulty}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Chip label="Favoris" tone="amber" active={favorites} onPress={() => setFavorites((v) => !v)} />
        </View>
        {visible.map((r) => {
          const local = app.locals.find((l) => l.id === r.id);
          const pending = !!local && (local.revision !== local.syncedRevision || local.state !== "finished");
          return (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir le parcours ${r.name}`}
              disabled={tools.busyId === r.id}
              onPress={() => void tools.open(r, onMap)}
              style={({ pressed }) => [
                s.card,
                { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <View style={{ width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" }}>
                <Icon name="map-outline" size={20} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <Badge label={r.examCenter || "À classer"} tone="blue" />
                  <Badge label={r.difficulty} />
                  {r.status === "published" && <Badge label="Publié" tone="green" />}
                  {r.favorite && <Badge label="Favori" tone="amber" />}
                </View>
                <Text numberOfLines={2} style={[s.heading, { fontSize: 17 }]}>{r.name}</Text>
                <Text style={s.muted}>
                  {formatDistance(r.distance)} · {Math.round(r.duration / 60)} min · {r.pointCount} repères
                </Text>
                <Text style={s.caption}>
                  {r.authorName}
                  {pending
                    ? local!.state === "recording" ? " · En cours" : local!.state === "paused" ? " · En pause" : " · À synchroniser"
                    : ""}
                </Text>
                {!!local?.error && (
                  <Text numberOfLines={2} style={s.error}>Synchronisation à reprendre : tirez la liste vers le bas.</Text>
                )}
              </View>
              <Icon name="arrow-forward" size={18} />
            </Pressable>
          );
        })}
        {!visible.length && (
          <Empty
            title={refreshing ? "Chargement des parcours…" : "Aucun parcours disponible"}
            description="Les parcours publiés par votre enseignant apparaîtront ici."
          />
        )}
        <Text style={s.caption}>
          Les parcours sont des exemples d’entraînement, pas des itinéraires officiels d’examen.
        </Text>
      </ScrollView>
      {tools.sheets}
    </>
  );
}
