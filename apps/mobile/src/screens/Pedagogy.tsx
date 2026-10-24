import {usePublishedCourses} from "../../../../packages/product/src/content";
import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, View, Linking } from "react-native";
import { useApp } from "../state";
import { colors, fonts, radius, styles as s } from "../theme";
import { Button, Disclosure, Dropdown, Empty, Icon, PageHeading, Segmented } from "../components/UI";
import { courses, courseSources } from "../pedagogy/courses";
import {useProductLearning} from "../../../../packages/product/src/hooks";
import {productClient,nativeReadingStorage,productTransport} from "../services/product-client";
import {LessonQuiz,StudyOverview,TeacherLessons} from "../components/CourseLearning";

/** Same groups and labels as the website's fiche picker. */
const groups = [
  ["C1", "C1 · Maîtriser le véhicule"],
  ["C2", "C2 · Circuler avec les autres"],
  ["Manœuvres", "Manœuvres"],
  ["Sécurité", "Sécurité et examen"],
] as const;

/** Mirrors the website's Fiches page: heading, tabs, Mon suivi, picker card, reading card, pagination. */
export function Pedagogy() {
  const app = useApp();
  const userId = app.profile!.id;
  const teacher = app.profile?.role !== "student";
  usePublishedCourses(productTransport, true);
  const learning = useProductLearning(userId, productClient, nativeReadingStorage);
  const { reading, loading, busy } = learning;
  const [view, setView] = useState<"lessons" | "students">("lessons");
  const [selectedId, setSelectedId] = useState(courses[0]!.id);
  const [onlyReview, setOnlyReview] = useState(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const readerY = useRef(0);
  const count = courses.filter((c) => reading[c.id]?.read).length;
  const reviewCount = courses.filter((c) => reading[c.id]?.review).length;
  const visible = onlyReview ? courses.filter((c) => reading[c.id]?.review) : courses;
  const selected = visible.find((c) => c.id === selectedId) || visible[0] || courses[0]!;
  const position = courses.findIndex((c) => c.id === selected.id);
  const options = useMemo(
    () =>
      groups.flatMap(([group, label]) =>
        visible
          .filter((c) => c.group === group)
          .map((c) => ({ id: c.id, label: `${c.code} · ${c.title}${reading[c.id]?.read ? " · Lu" : ""}`, section: label })),
      ),
    [visible, reading],
  );
  function choose(id: string, toReader = false) {
    setSelectedId(id);
    if (toReader) scroll.current?.scrollTo({ y: Math.max(0, readerY.current - 12), animated: true });
  }
  const read = !!reading[selected.id]?.read, review = !!reading[selected.id]?.review;
  return (
    <ScrollView ref={scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <PageHeading eyebrow="APPRENDRE AVEC LE REPÈRE" title="Fiches pédagogiques" subtitle="Un objectif. Des étapes claires. À ton rythme." />
      {teacher && (
        <Segmented
          label="Espace pédagogique"
          value={view}
          onChange={setView}
          options={[{ id: "lessons", label: "Les cours" }, { id: "students", label: "Suivi des élèves" }]}
        />
      )}
      {view === "students" && teacher ? (
        <TeacherLessons />
      ) : (
        <>
          {!!learning.error && (
            <View style={[s.card, { backgroundColor: colors.redSoft, borderColor: colors.redSoft }]}>
              <Text style={s.error} accessibilityRole="alert">{learning.error}</Text>
              <Button compact secondary label="Réessayer" onPress={() => void learning.refresh()} />
            </View>
          )}
          <Disclosure title={`Mon suivi · ${count} fiches lues`}>
            <StudyOverview reading={reading} quizzes={learning.quizzes} plan={learning.plan} choose={(id) => { setOnlyReview(false); choose(id, true); }} />
          </Disclosure>

          <View style={[s.card, { padding: 18, gap: 12 }]} accessibilityLabel="Choix de la fiche">
            <View style={s.between}>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.ink }}>Choisis ton objectif</Text>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: colors.wine, backgroundColor: colors.soft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: "hidden" }}>
                {count} / {courses.length} fiches lues
              </Text>
            </View>
            {visible.length ? (
              <Dropdown label="Fiche" value={selected.id} options={options} onChange={(id) => choose(id)} />
            ) : (
              <Text style={s.muted}>Aucune fiche à revoir</Text>
            )}
            <View style={[s.between, { minHeight: 44 }]}>
              <Text style={[s.muted, { flex: 1 }]}>Seulement mes fiches à revoir ({reviewCount})</Text>
              <Switch
                accessibilityLabel="Seulement mes fiches à revoir"
                value={onlyReview}
                trackColor={{ true: colors.wine, false: colors.line }}
                onValueChange={(on) => {
                  setOnlyReview(on);
                  if (on) {
                    const first = courses.find((c) => reading[c.id]?.review);
                    if (first && !reading[selectedId]?.review) choose(first.id);
                  }
                }}
              />
            </View>
          </View>

          {loading && <ActivityIndicator color={colors.wine} />}
          {!visible.length ? (
            <Empty title="Aucune fiche à revoir" description="Décoche le filtre pour retrouver tous les objectifs." />
          ) : (
            <View
              key={selected.id}
              onLayout={(e) => { readerY.current = e.nativeEvent.layout.y; }}
              style={[s.card, { padding: 22, gap: 16, borderRadius: radius.xl }]}
            >
              <View style={[s.row, { gap: 10 }]}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.paper, backgroundColor: colors.wine, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, overflow: "hidden" }}>
                  FICHE {selected.code}
                </Text>
                <Text style={s.caption}>{selected.minutes} min de lecture</Text>
              </View>
              <Text selectable style={[s.title, { fontSize: 26, lineHeight: 31 }]} accessibilityRole="header">{selected.title}</Text>
              <Text selectable style={[s.body, { fontSize: 17, lineHeight: 26 }]}>{selected.intro}</Text>

              <View style={{ backgroundColor: colors.soft, borderRadius: radius.lg, padding: 18, gap: 6 }}>
                <Text style={[s.eyebrow, { letterSpacing: 1.4 }]}>TON OBJECTIF</Text>
                <Text selectable style={{ fontFamily: fonts.displayBold, fontSize: 17, lineHeight: 24, color: colors.ink }}>{selected.objective}</Text>
              </View>

              {selected.steps.map((step, i) => (
                <View key={step.title} style={{ flexDirection: "row", gap: 14 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.wine, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: fonts.display, fontSize: 13, color: colors.wine }}>{String(i + 1).padStart(2, "0")}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text style={[s.heading, { fontSize: 18, lineHeight: 24, marginTop: 4 }]}>{step.title}</Text>
                    <Text selectable style={[s.body, { lineHeight: 25 }]}>{step.explanation}</Text>
                    <Text selectable style={[s.muted, { lineHeight: 21 }]}>
                      <Text style={{ fontFamily: fonts.bodySemi, color: colors.ink }}>Pourquoi ? </Text>
                      {step.why}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={{ backgroundColor: colors.cream, borderRadius: radius.lg, padding: 18, gap: 8 }}>
                <Text style={[s.eyebrow, { letterSpacing: 1.4 }]}>EN SITUATION</Text>
                <Text selectable style={s.body}>{selected.example}</Text>
              </View>

              <Disclosure card={false} title="Les erreurs à éviter" tone={colors.red}>
                {selected.traps.map((t) => (
                  <View key={t} style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={s.body}>•</Text>
                    <Text selectable style={[s.body, { flex: 1 }]}>{t}</Text>
                  </View>
                ))}
                <Text selectable style={s.muted}>{selected.safety}</Text>
              </Disclosure>

              <View style={{ backgroundColor: colors.night, borderRadius: radius.lg, padding: 20, gap: 8 }}>
                <Text style={[s.eyebrow, { color: colors.blush, letterSpacing: 1.4 }]}>LE REPÈRE À GARDER</Text>
                <Text selectable style={{ fontFamily: fonts.displayBold, fontSize: 19, lineHeight: 26, color: colors.paper }}>{selected.takeaway}</Text>
              </View>

              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL(selected.video.url).catch(() => app.setMessage("Impossible d’ouvrir la vidéo."))}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, transform: [{ scale: pressed ? 0.98 : 1 }] })}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.wine, alignItems: "center", justifyContent: "center" }}>
                  <Icon name="play" size={18} color={colors.paper} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.ink }}>Voir la vidéo complémentaire</Text>
                  <Text style={s.caption}>{selected.video.title} · {selected.video.channel}</Text>
                </View>
                <Icon name="arrow-forward" size={17} />
              </Pressable>
              {!!selected.videoNote && <Text style={s.caption}>{selected.videoNote}</Text>}

              <Disclosure card={false} title="Références et conseils de lecture">
                <Text style={s.muted}>
                  La démonstration complète la fiche. Adapte les repères à ta voiture avec ton enseignant ; les commandes et la boîte de vitesses peuvent différer.
                </Text>
                {selected.references.map((id) => (
                  <Pressable key={id} accessibilityRole="link" onPress={() => void Linking.openURL(courseSources[id].url).catch(() => app.setMessage("Impossible d’ouvrir la référence."))} style={{ minHeight: 44, justifyContent: "center" }}>
                    <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.wine, textDecorationLine: "underline" }}>{courseSources[id].label} ↗</Text>
                  </Pressable>
                ))}
              </Disclosure>

              <View style={{ gap: 10 }}>
                <Button busy={busy} icon="checkmark" label={read ? "Fiche lue · Annuler" : "J’ai lu cette fiche"} onPress={() => void learning.update(selected.id, { read: !read })} />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: review, disabled: busy }}
                  disabled={busy}
                  onPress={() => void learning.update(selected.id, { review: !review })}
                  style={({ pressed }) => ({ minHeight: 48, borderRadius: 14, borderWidth: review ? 0 : 1.5, borderColor: colors.line, backgroundColor: review ? colors.redSoft : "transparent", alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.97 : 1 }] })}
                >
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: review ? colors.red : colors.ink }}>{review ? "À revoir · Retirer" : "Garder pour réviser"}</Text>
                </Pressable>
              </View>

              <LessonQuiz key={selected.id} course={selected} onChanged={() => void learning.refresh()} />

              <View accessibilityLabel="Navigation entre les fiches" style={{ flexDirection: "row", gap: 10, paddingTop: 16, borderTopWidth: 1, borderColor: colors.line }}>
                {[
                  { label: "← Fiche précédente", target: courses[position - 1], align: "flex-start" as const },
                  { label: "Fiche suivante →", target: courses[position + 1], align: "flex-end" as const },
                ].map(({ label, target, align }) => (
                  <Pressable
                    key={label}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !target }}
                    disabled={!target}
                    onPress={() => { if (target) { setOnlyReview(false); choose(target.id, true); } }}
                    style={({ pressed }) => ({ flex: 1, minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, paddingHorizontal: 14, justifyContent: "center", alignItems: align, opacity: target ? 1 : 0.4, transform: [{ scale: pressed ? 0.97 : 1 }] })}
                  >
                    <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.wine }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          <Text style={s.caption}>
            {learning.error ? "Le suivi n’est pas encore synchronisé. Réessaie avec une connexion stable." : "Ton suivi est enregistré dans ton espace connecté."} La maîtrise se travaille en voiture avec ton enseignant.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
