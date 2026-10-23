import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as Crypto from "expo-crypto";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import {
  difficulties,
  categories,
  exportGpx,
  importGpx,
  formatDistance,
  routeDuration,
  type Route,
  type RouteSummary,
  type RouteInput,
} from "@repere/core";
import { useApp } from "../state";
import { colors, styles as s } from "../theme";
import {
  Button,
  Chip,
  Empty,
  Field,
  Icon,
  IconButton,
  Sheet,
} from "../components/UI";
import { request } from "../services/auth";
import { syncAll } from "../services/sync";
import {
  directoryCenters,
  NO_CENTER,
  normalizeSearch,
  matchesRoute,
  routeCenter,
} from "../services/route-directory";
import {
  putLocalRoute,
  routeInput,
  updateLocal,
  removeLocal,
  getLocal,
} from "../services/local";
import { localSummary } from "../services/sync";
export function Library({ onMap }: { onMap: () => void }) {
  const app = useApp();
  const [search, setSearch] = useState(""),
    [difficulty, setDifficulty] = useState("Tous"),
    [category, setCategory] = useState("Toutes"),
    [favorites, setFavorites] = useState(false),
    [refreshing, setRefreshing] = useState(false),
    [busyId, setBusyId] = useState<string | null>(null),
    [edit, setEdit] = useState<RouteSummary | null>(null),
    [editName, setEditName] = useState(""),
    [description, setDescription] = useState(""),
    [level, setLevel] = useState<RouteInput["difficulty"]>("Facile"),
    [publish, setPublish] = useState(false),
    [examCenter, setExamCenter] = useState(""),
    [center, setCenter] = useState("Tous les centres");
  const teacher = app.profile?.role !== "student";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterCount =
    Number(difficulty !== "Tous") +
    Number(category !== "Toutes") +
    Number(favorites) +
    Number(center !== "Tous les centres");
  async function synchronize() {
    setRefreshing(true);
    try {
      const result = await syncAll(app.profile!.id);
      await app.reloadLocal();
      await app.refresh();
      if (result.errors.length) throw new Error(result.errors[0]);
      app.setMessage("Modifications synchronisées.");
    } catch (e) {
      error(e);
    } finally {
      setRefreshing(false);
    }
  }
  function addMenu() {
    Alert.alert("Ajouter un parcours", undefined, [
      {
        text: "Enregistrer",
        onPress: () => {
          app.select(null);
          onMap();
        },
      },
      { text: "Importer un GPX", onPress: () => void importFile() },
      { text: "Annuler", style: "cancel" },
    ]);
  }
  const allRoutes = useMemo(() => {
    const map = new Map(app.routes.map((r) => [r.id, r]));
    for (const r of app.locals.filter(
      (r) => r.state !== "finished" || r.fixes.length >= 2,
    ))
      if (
        !map.has(r.id) ||
        r.state !== "finished" ||
        r.syncedRevision !== r.revision
      )
        map.set(r.id, {
          ...localSummary(r),
          authorId: map.get(r.id)?.authorId || r.userId,
          favorite: map.get(r.id)?.favorite || false,
        });
    return [...map.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [app.routes, app.locals]);
  const centers = useMemo(() => directoryCenters(allRoutes), [allRoutes]);
  const merged = useMemo(
    () =>
      allRoutes.filter((r) =>
        matchesRoute(r, { search, center, difficulty, category, favorites }),
      ),
    [allRoutes, search, center, difficulty, category, favorites],
  );
  const error = (e: unknown) =>
    app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  async function fetchRoute(r: RouteSummary) {
    const local = app.locals.find((l) => l.id === r.id);
    if (
      local &&
      (local.syncedRevision !== local.revision || local.state !== "finished")
    )
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
  async function open(r: RouteSummary) {
    setBusyId(r.id);
    try {
      if (app.active && app.active.id !== r.id)
        throw new Error(
          "Terminez l’enregistrement en cours pour ouvrir ce parcours.",
        );
      const detail = await fetchRoute(r);
      app.select(detail);
      onMap();
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  async function localize(r: RouteSummary) {
    if (!app.profile) return null;
    const existing = await getLocal(r.id);
    return existing || putLocalRoute(app.profile.id, await fetchRoute(r));
  }
  async function importFile() {
    if (!app.profile) return;
    try {
      if (app.active)
        throw new Error(
          "Terminez l’enregistrement en cours avant d’importer un parcours.",
        );
      const pick = await DocumentPicker.getDocumentAsync({
        type: [
          "application/gpx+xml",
          "application/xml",
          "text/xml",
          "application/octet-stream",
        ],
        copyToCacheDirectory: true,
      });
      if (pick.canceled) return;
      const asset = pick.assets[0]!;
      if (asset.size && asset.size > 8_000_000)
        throw new Error("Fichier trop volumineux (8 Mo maximum).");
      const file = new File(asset.uri);
      const input = importGpx(await file.text(), Crypto.randomUUID());
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
      onMap();
      void app.sync();
      app.setMessage(
        "GPX importé. Ce parcours est clairement identifié comme un import.",
      );
    } catch (e) {
      error(e);
    }
  }
  async function exportFile(r: RouteSummary) {
    try {
      const detail = await fetchRoute(r);
      const f = new File(Paths.cache, `repere-${r.id}.gpx`);
      f.write(exportGpx(detail));
      if (await Sharing.isAvailableAsync())
        await Sharing.shareAsync(f.uri, {
          mimeType: "application/gpx+xml",
          UTI: "com.topografix.gpx",
        });
      else throw new Error("Le partage est indisponible sur cet appareil.");
    } catch (e) {
      error(e);
    }
  }
  async function rename(r: RouteSummary, name: string) {
    name = name.trim();
    if (!name || name.length > 120) {
      app.setMessage("Choisissez un nom de 1 à 120 caractères.");
      return;
    }
    setBusyId(r.id);
    try {
      await localize(r);
      await updateLocal(r.id, { name });
      await app.reloadLocal();
      await app.sync();
      app.setMessage("Nom du parcours enregistré.");
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  function menu(r: RouteSummary) {
    const own = r.authorId === app.profile?.id || app.profile?.role === "admin";
    const local = app.locals.find((l) => l.id === r.id);
    Alert.alert(r.name, local?.error || "Parcours d’entraînement", [
      ...(teacher && own
        ? [
            {
              text: "Renommer",
              onPress: () =>
                Alert.prompt(
                  "Renommer le parcours",
                  "Nom du parcours",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Enregistrer",
                      onPress: (name?: string) => void rename(r, name || ""),
                    },
                  ],
                  "plain-text",
                  r.name,
                ),
            },
          ]
        : []),
      { text: "Exporter le GPX", onPress: () => void exportFile(r) },
      ...(teacher
        ? [
            {
              text: "Dupliquer",
              onPress: async () => {
                try {
                  const detail = await fetchRoute(r);
                  const copy = {
                    ...detail,
                    id: Crypto.randomUUID(),
                    version: 0,
                    status: "private" as const,
                    name: `${detail.name.slice(0, 100)} — copie`,
                    points: detail.points.map((p) => ({
                      ...p,
                      id: Crypto.randomUUID(),
                      validated: p.answer !== undefined && !!p.explanation,
                      photos: p.photos.map((ph) => ({
                        ...ph,
                        id: Crypto.randomUUID(),
                      })),
                    })),
                  };
                  await putLocalRoute(app.profile!.id, copy);
                  await app.reloadLocal();
                  void app.sync();
                } catch (e) {
                  error(e);
                }
              },
            },
          ]
        : []),
      ...(teacher && own
        ? [
            {
              text: "Modifier le parcours / centre",
              onPress: () => {
                setEdit(r);
                setEditName(r.name);
                setDescription(r.description);
                setLevel(r.difficulty);
                setPublish(r.status === "published");
                setExamCenter(r.examCenter || "");
              },
            },
            {
              text: "Supprimer",
              style: "destructive" as const,
              onPress: () =>
                Alert.alert(
                  "Supprimer ce parcours ?",
                  "Cette action supprime aussi ses points et les attributions.",
                  [
                    { text: "Annuler" },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          if (r.version > 0)
                            await request(`/v1/routes/${r.id}`, {
                              method: "DELETE",
                            });
                          await removeLocal(r.id);
                          if (app.selected?.id === r.id) app.select(null);
                          await app.refresh();
                          await app.reloadLocal();
                        } catch (e) {
                          error(e);
                        }
                      },
                    },
                  ],
                ),
            },
          ]
        : []),
      { text: "Annuler", style: "cancel" },
    ]);
  }
  const [students, setStudents] = useState<
      { id: string; name: string; email: string }[]
    >([]),
    [assigned, setAssigned] = useState<string[]>([]),
    [assignVisible, setAssignVisible] = useState(false);
  async function assignments() {
    if (!edit) return;
    try {
      if (edit.version === 0)
        throw new Error("Synchronisez d’abord ce parcours.");
      const [users, links] = await Promise.all([
        request<{ students: typeof students }>("/v1/students"),
        request<{ students: string[] }>(`/v1/routes/${edit.id}/assignments`),
      ]);
      setStudents(users.students);
      setAssigned(links.students);
      setAssignVisible(true);
    } catch (e) {
      error(e);
    }
  }
  async function save() {
    if (!edit || !editName.trim()) return;
    setBusyId(edit.id);
    try {
      await localize(edit);
      await updateLocal(edit.id, {
        name: editName.trim(),
        description,
        difficulty: level,
        examCenter: examCenter.trim(),
        status: publish ? "published" : "private",
      });
      await app.reloadLocal();
      const result = await syncAll(app.profile!.id);
      if (result.errors.length) throw new Error(result.errors[0]);
      await app.refresh();
      setEdit(null);
      app.setMessage(
        publish
          ? "Parcours publié, visible par les élèves connectés."
          : "Parcours enregistré.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  async function changePublication(r: RouteSummary) {
    if (!app.profile) return;
    setBusyId(r.id);
    try {
      await localize(r);
      const local = await getLocal(r.id);
      if (!local || local.state !== "finished")
        throw new Error("Terminez l’enregistrement avant de publier.");
      await updateLocal(r.id, {
        status: r.status === "published" ? "private" : "published",
      });
      await app.reloadLocal();
      const result = await syncAll(app.profile.id);
      if (result.errors.length) throw new Error(result.errors[0]);
      const verified = await request<Route>(`/v1/routes/${r.id}`);
      if (
        verified.status !== (r.status === "published" ? "private" : "published")
      )
        throw new Error("La publication n’a pas été confirmée. Réessayez.");
      if (app.selected?.id === r.id) app.select(verified);
      await app.refresh();
      app.setMessage(
        verified.status === "published"
          ? "Publié : les élèves connectés peuvent ouvrir ce parcours et ses repères."
          : "Publication retirée. Les attributions individuelles restent actives.",
      );
    } catch (e) {
      error(e);
    } finally {
      setBusyId(null);
    }
  }
  function confirmPublication(r: RouteSummary) {
    Alert.alert(
      r.status === "published"
        ? "Retirer de la bibliothèque des élèves ?"
        : "Publier pour les élèves ?",
      r.status === "published"
        ? "Les élèves auxquels il est attribué conserveront leur accès."
        : "Le tracé GPS et ses repères seront accessibles à tous les comptes connectés de cette application.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: r.status === "published" ? "Retirer la publication" : "Publier",
          onPress: () => void changePublication(r),
        },
      ],
    );
  }
  return (
    <>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.wine}
            onRefresh={() => void synchronize()}
          />
        }
      >
        <View style={s.between}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[s.title, { fontSize: 26, lineHeight: 32 }]}>
              Parcours
            </Text>
            <Text style={s.caption}>
              {merged.length} parcours{filterCount ? " · liste filtrée" : ""}
            </Text>
          </View>
          {teacher && (
            <IconButton
              name="add"
              label="Ajouter un parcours ou importer un GPX"
              onPress={addMenu}
            />
          )}
        </View>
        <Field
          label="Rechercher"
          value={search}
          onChangeText={setSearch}
          placeholder="Nom ou centre d’examen"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {["Tous les centres", ...centers].map((c) => (
            <Chip
              key={c}
              label={c}
              tone="blue"
              active={center === c}
              onPress={() => setCenter(c)}
            />
          ))}
        </ScrollView>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Button
              compact
              secondary
              icon="options-outline"
              label={filterCount ? `Filtres · ${filterCount}` : "Filtres"}
              onPress={() => setFiltersOpen(true)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              compact
              secondary
              icon="sync-outline"
              label="Synchroniser"
              busy={refreshing}
              onPress={() => void synchronize()}
            />
          </View>
        </View>
        {merged.length === 0 ? (
          <Empty
            title={search || filterCount ? "Aucun résultat" : "Aucun parcours"}
            description={
              search || filterCount
                ? "Modifiez la recherche ou les filtres."
                : teacher
                  ? "Touchez + pour enregistrer ou importer un parcours."
                  : "Votre enseignant peut publier un parcours pour les élèves ou vous l’attribuer."
            }
          />
        ) : (
          merged.map((r) => {
            const local = app.locals.find((l) => l.id === r.id),
              dirty = local && local.revision !== local.syncedRevision;
            return (
              <Pressable
                key={r.id}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir le parcours ${r.name}`}
                onPress={() => void open(r)}
                disabled={busyId === r.id}
                style={({ pressed }) => [
                  s.card,
                  { opacity: pressed ? 0.8 : 1, padding: 16, gap: 8 },
                ]}
              >
                <View style={s.between}>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text
                      numberOfLines={2}
                      style={[s.heading, { fontSize: 18 }]}
                    >
                      {r.name}
                    </Text>
                    <Text style={s.caption}>
                      {r.source === "gpx" ? "GPX · " : ""}
                      {dirty
                        ? "Modifications en attente"
                        : r.status === "published"
                          ? "Visible par les élèves"
                          : "Non publié"}{" "}
                      · {r.difficulty}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Actions pour ${r.name}`}
                    hitSlop={8}
                    style={{
                      width: 44,
                      height: 44,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={(event) => {
                      event.stopPropagation();
                      menu(r);
                    }}
                  >
                    <Icon name="ellipsis-horizontal" />
                  </Pressable>
                </View>
                <Text
                  style={[s.caption, { color: colors.blue, fontWeight: "600" }]}
                >
                  {routeCenter(r)}
                </Text>
                <Text style={s.muted}>
                  {formatDistance(r.distance)}
                  {r.duration > 0 ? ` · ${routeDuration(r)}` : ""} ·{" "}
                  {r.pointCount} {r.pointCount === 1 ? "repère" : "repères"}
                </Text>
                <View style={s.between}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.caption,
                        {
                          color: dirty
                            ? colors.wine
                            : r.version > 0
                              ? colors.green
                              : colors.muted,
                        },
                      ]}
                    >
                      {local?.state === "paused"
                        ? "En pause"
                        : local?.state === "recording"
                          ? "En cours"
                          : dirty
                            ? "À synchroniser"
                            : r.version > 0
                              ? "Synchronisé"
                              : "Sur cet iPhone"}
                    </Text>
                  </View>
                  <View style={s.row}>
                    <Pressable
                      accessibilityRole="button"
                      style={{
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      accessibilityLabel={
                        r.favorite
                          ? "Retirer des favoris"
                          : "Ajouter aux favoris"
                      }
                      hitSlop={10}
                      onPress={async (event) => {
                        event.stopPropagation();
                        try {
                          await request(`/v1/routes/${r.id}/favorite`, {
                            method: "POST",
                            body: JSON.stringify({ active: !r.favorite }),
                          });
                          await app.refresh();
                        } catch (e) {
                          error(e);
                        }
                      }}
                    >
                      <Icon
                        name={r.favorite ? "heart" : "heart-outline"}
                        size={21}
                      />
                    </Pressable>
                  </View>
                </View>
                {teacher &&
                  (r.authorId === app.profile?.id ||
                    app.profile?.role === "admin") && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        dirty
                          ? `Synchroniser les modifications de ${r.name}`
                          : r.status === "published"
                            ? `Retirer la publication de ${r.name}`
                            : `Publier ${r.name} pour les élèves`
                      }
                      accessibilityState={{
                        disabled: busyId === r.id || refreshing,
                        busy: busyId === r.id || refreshing,
                      }}
                      disabled={busyId === r.id || refreshing}
                      onPress={(event) => {
                        event.stopPropagation();
                        if (dirty) void synchronize();
                        else confirmPublication(r);
                      }}
                      style={({ pressed }) => ({
                        minHeight: 46,
                        borderRadius: 12,
                        flexDirection: "row",
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: dirty
                          ? colors.amberSoft
                          : r.status === "published"
                            ? colors.greenSoft
                            : colors.wine,
                        opacity: pressed ? 0.75 : 1,
                      })}
                    >
                      <Icon
                        name={
                          dirty
                            ? "sync-outline"
                            : r.status === "published"
                              ? "checkmark-circle-outline"
                              : "people-outline"
                        }
                        size={18}
                        color={
                          dirty
                            ? colors.amber
                            : r.status === "published"
                              ? colors.green
                              : "white"
                        }
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: dirty
                            ? colors.amber
                            : r.status === "published"
                              ? colors.green
                              : "white",
                        }}
                      >
                        {busyId === r.id || refreshing
                          ? "Enregistrement…"
                          : dirty
                            ? "Synchroniser les modifications"
                            : r.status === "published"
                              ? "Publié · gérer la visibilité"
                              : "Publier pour les élèves"}
                      </Text>
                    </Pressable>
                  )}
                {!!local?.error && (
                  <Text numberOfLines={2} style={s.error}>
                    Synchronisation à reprendre. Touchez Synchroniser.
                  </Text>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <Sheet
        visible={filtersOpen}
        title="Filtres"
        onClose={() => setFiltersOpen(false)}
      >
        <Text style={s.label}>Difficulté</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {["Tous", ...difficulties].map((d) => (
            <Chip
              key={d}
              label={d}
              active={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </View>
        <Text style={s.label}>Repères du parcours</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {["Toutes", ...categories].map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
        <Chip
          label="Favoris uniquement"
          active={favorites}
          onPress={() => setFavorites((value) => !value)}
        />
        <Button
          label={`Afficher ${merged.length} parcours`}
          onPress={() => setFiltersOpen(false)}
        />
        {!!filterCount && (
          <Button
            label="Réinitialiser les filtres"
            secondary
            onPress={() => {
              setDifficulty("Tous");
              setCategory("Toutes");
              setFavorites(false);
              setCenter("Tous les centres");
            }}
          />
        )}
      </Sheet>
      <Sheet
        visible={!!edit}
        title={assignVisible ? "Attribuer ce parcours" : "Votre parcours"}
        onClose={() => {
          if (assignVisible) setAssignVisible(false);
          else setEdit(null);
        }}
      >
        {assignVisible ? (
          <>
            {students
              .filter(
                (p) =>
                  (p as any).role === undefined ||
                  (p as any).role === "student",
              )
              .map((student) => (
                <Pressable
                  key={student.id}
                  style={s.card}
                  onPress={() =>
                    setAssigned((a) =>
                      a.includes(student.id)
                        ? a.filter((id) => id !== student.id)
                        : [...a, student.id],
                    )
                  }
                >
                  <View style={s.between}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.body}>{student.name}</Text>
                      <Text style={s.muted}>{student.email}</Text>
                    </View>
                    <Icon
                      name={
                        assigned.includes(student.id)
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                    />
                  </View>
                </Pressable>
              ))}
            {students.length === 0 && (
              <Text style={s.muted}>
                Invitez d’abord vos élèves depuis votre espace.
              </Text>
            )}
            <Button
              label="Enregistrer les attributions"
              onPress={async () => {
                try {
                  await request(`/v1/routes/${edit!.id}/assignments`, {
                    method: "PUT",
                    body: JSON.stringify({ students: assigned }),
                  });
                  setAssignVisible(false);
                  app.setMessage("Attributions enregistrées.");
                } catch (e) {
                  error(e);
                }
              }}
            />
          </>
        ) : (
          <>
            <Field
              label="Nom"
              value={editName}
              onChangeText={setEditName}
              maxLength={120}
            />
            <Field
              label="Description"
              multiline
              value={description}
              onChangeText={setDescription}
              maxLength={3000}
            />
            <Field
              label="Centre d’examen"
              value={examCenter}
              onChangeText={setExamCenter}
              placeholder="Ex. Nanterre ou Gennevilliers"
              maxLength={100}
            />
            {centers.some((c) => c !== NO_CENTER) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {centers
                  .filter((c) => c !== NO_CENTER)
                  .map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      tone="blue"
                      active={
                        normalizeSearch(examCenter) === normalizeSearch(c)
                      }
                      onPress={() => setExamCenter(c)}
                    />
                  ))}
              </ScrollView>
            )}
            <Text style={s.caption}>
              Choisissez un centre existant ou saisissez son nom.
            </Text>
            <Text style={s.label}>Difficulté</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {difficulties.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={level === d}
                  onPress={() => setLevel(d)}
                />
              ))}
            </View>
            <View style={s.row}>
              <Chip
                label="Brouillon privé"
                active={!publish}
                onPress={() => setPublish(false)}
              />
              <Chip
                label="Visible par les élèves"
                active={publish}
                onPress={() => setPublish(true)}
              />
            </View>
            <Text style={s.caption}>
              {publish
                ? "Tous les élèves connectés pourront consulter ce parcours."
                : "Vous et vos élèves autorisés pourrez consulter ce parcours."}
            </Text>
            <Button
              label="Enregistrer les modifications"
              onPress={() => void save()}
              busy={!!busyId}
            />
            <Button
              label="Attribuer à mes élèves"
              secondary
              icon="people-outline"
              onPress={() => void assignments()}
            />
          </>
        )}
      </Sheet>
    </>
  );
}
