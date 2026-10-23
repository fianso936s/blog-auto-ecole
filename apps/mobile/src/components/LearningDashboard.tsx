import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  categories,
  csvCell,
  type LearningCounts,
  type LearningStats,
} from "@repere/core";
import { request } from "../services/auth";
import { useApp } from "../state";
import { colors, styles as s } from "../theme";
import { Button, Chip, Field, Sheet } from "./UI";

const success = (row: LearningCounts) =>
  row.firstAttempts
    ? `${Math.round((row.firstCorrect / row.firstAttempts) * 100)} %`
    : "—";
export function LearningDashboard({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const app = useApp(),
    teacher = app.profile?.role !== "student";
  const [stats, setStats] = useState<LearningStats | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [refresh, setRefresh] = useState(0);
  const [days, setDays] = useState(30),
    [category, setCategory] = useState("Toutes"),
    [search, setSearch] = useState(""),
    [tab, setTab] = useState<"spots" | "students">("spots");
  const [spot, setSpot] = useState<{ id: string; name: string } | null>(null),
    [student, setStudent] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    if (!visible) return;
    let alive = true;
    setBusy(true);
    setStats(null);
    setError("");
    const query = new URLSearchParams({
      from: new Date(Date.now() - days * 86400000).toISOString(),
      to: new Date().toISOString(),
    });
    if (category !== "Toutes") query.set("category", category);
    if (spot) query.set("spotId", spot.id);
    if (student && teacher) query.set("studentId", student.id);
    request<LearningStats>(`/v1/learning/stats?${query}`)
      .then((data) => {
        if (alive) setStats(data);
      })
      .catch((e) => {
        if (alive) {
          setStats(null);
          setError(
            e instanceof Error ? e.message : "Statistiques indisponibles.",
          );
        }
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, [
    visible,
    days,
    category,
    spot?.id,
    student?.id,
    teacher,
    refresh,
    app.profile?.id,
  ]);
  const rows = useMemo(() => {
    const q = search
      .toLocaleLowerCase("fr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return (
      tab === "students" && teacher ? stats?.students || [] : stats?.spots || []
    ).filter((row) =>
      row.name
        .toLocaleLowerCase("fr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(q),
    );
  }, [stats, tab, teacher, search]);
  async function exportCsv() {
    if (!stats) return;
    try {
      const lines = [
        [
          "Type",
          "Identifiant",
          "Nom",
          "Catégorie",
          "Ouvertures",
          "Photos ouvertes",
          "Tentatives",
          "Premières réponses",
          "Premières réponses justes",
          "Archivé",
          "Début période",
          "Fin période",
        ],
        ...stats.spots.map((row) => [
          "Repère",
          row.id,
          row.name,
          row.category,
          row.views,
          row.photoViews,
          row.attempts,
          row.firstAttempts,
          row.firstCorrect,
          row.archived,
          stats.period.from,
          stats.period.to,
        ]),
        ...(teacher
          ? stats.students.map((row) => [
              "Élève",
              row.id,
              row.name,
              "",
              row.views,
              row.photoViews,
              row.attempts,
              row.firstAttempts,
              row.firstCorrect,
              "",
              stats.period.from,
              stats.period.to,
            ])
          : []),
      ];
      const file = new File(
        Paths.cache,
        `repere-statistiques-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      file.write(
        "\uFEFF" +
          lines
            .map((line) =>
              line
                .map((value) => csvCell(value as string | number | boolean))
                .join(";"),
            )
            .join("\r\n"),
      );
      if (!(await Sharing.isAvailableAsync()))
        throw new Error("Le partage de fichiers n’est pas disponible.");
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export indisponible.");
    }
  }
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={teacher ? "Suivi des élèves" : "Mon apprentissage"}
    >
      <Text style={s.muted}>
        {teacher
          ? "Les consultations et réponses aux repères que vous partagez."
          : "Votre activité et vos premières réponses aux quiz."}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[7, 30, 90, 365].map((n) => (
          <Chip
            key={n}
            label={`${n} jours`}
            active={days === n}
            onPress={() => setDays(n)}
          />
        ))}
      </View>
      <Text style={s.label}>Catégorie</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {["Toutes", ...categories].map((value) => (
          <Chip
            key={value}
            label={value}
            active={category === value}
            onPress={() => setCategory(value)}
          />
        ))}
      </View>
      {(spot || student) && (
        <View style={s.card}>
          <Text style={s.body}>
            {[spot?.name, student?.name].filter(Boolean).join(" · ")}
          </Text>
          <Button
            label="Retirer le filtre"
            secondary
            onPress={() => {
              setSpot(null);
              setStudent(null);
            }}
          />
        </View>
      )}
      {busy && (
        <Text accessibilityRole="status" style={s.muted}>
          Actualisation des statistiques…
        </Text>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {stats && (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {[
              ["Ouvertures", stats.totals.views],
              ["Photos ouvertes", stats.totals.photoViews],
              ["Réussite au premier essai", success(stats.totals)],
              ["Tentatives", stats.totals.attempts],
            ].map(([label, value]) => (
              <View key={label} style={[s.card, { width: "47%", gap: 8 }]}>
                <Text style={[s.title, { fontVariant: ["tabular-nums"] }]}>
                  {value}
                </Text>
                <Text style={s.caption}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={s.caption}>
            {stats.totals.firstCorrect} première(s) réponse(s) juste(s) sur{" "}
            {stats.totals.firstAttempts}. Les nouvelles tentatives restent
            distinctes. Un nouveau quiz publié démarre une nouvelle série de
            premières réponses.
          </Text>
          {teacher && (
            <View style={s.row}>
              <Chip
                label="Par repère"
                active={tab === "spots"}
                onPress={() => setTab("spots")}
              />
              <Chip
                label="Par élève"
                active={tab === "students"}
                onPress={() => setTab("students")}
              />
            </View>
          )}
          <Field
            label={
              tab === "students" && teacher
                ? "Rechercher un élève"
                : "Rechercher un repère"
            }
            value={search}
            onChangeText={setSearch}
            placeholder="Nom…"
          />
          {!rows.length && (
            <Text style={s.muted}>
              Aucune activité pour ces filtres. Les statistiques se remplissent
              à mesure que les élèves consultent les repères et répondent.
            </Text>
          )}
          {rows.map((row) => (
            <View key={row.id} style={s.card}>
              <Text style={s.heading}>{row.name}</Text>
              {"category" in row && (
                <Text style={s.eyebrow}>
                  {row.category}
                  {row.archived ? " · ARCHIVÉ" : ""}
                </Text>
              )}
              <Text style={s.body}>
                {row.views} ouverture(s) · {row.photoViews} photo(s) ouverte(s)
              </Text>
              <Text style={[s.body, { color: colors.wine }]}>
                {success(row)} au premier essai · {row.attempts} tentative(s)
              </Text>
              {teacher && (
                <Button
                  label={
                    tab === "students"
                      ? "Voir ses repères"
                      : "Voir les élèves et les résultats"
                  }
                  secondary
                  onPress={() => {
                    if (tab === "students") {
                      setStudent({ id: row.id, name: row.name });
                      setTab("spots");
                    } else {
                      setSpot({ id: row.id, name: row.name });
                      setTab("students");
                    }
                    setSearch("");
                  }}
                />
              )}
            </View>
          ))}
          <Button
            label="Exporter les statistiques CSV"
            secondary
            icon="download-outline"
            disabled={busy}
            onPress={() => void exportCsv()}
          />
        </>
      )}
      <Button
        label="Actualiser"
        secondary
        icon="sync-outline"
        busy={busy}
        onPress={() => setRefresh((n) => n + 1)}
      />
      <Button label="Fermer" secondary onPress={onClose} />
    </Sheet>
  );
}
