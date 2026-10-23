import {usePublishedCourses} from "../../../../packages/product/src/content";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  Linking,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useApp } from "../state";
import { colors, tones, styles as s, type Tone } from "../theme";
import { Button, Chip, Empty, Field, Icon, IconButton } from "../components/UI";
import { ModalFrame } from "../components/ModalFrame";
import { courses, courseSources, type Course } from "../pedagogy/courses";
import {useProductLearning} from "../../../../packages/product/src/hooks";
import {productClient,nativeReadingStorage,productTransport} from "../services/product-client";
import {LessonQuiz,StudyOverview,TeacherLessons} from "../components/CourseLearning";
import { normalizeSearch } from "../services/route-directory";
const groups = [
  { id: "Tous", label: "Tout", tone: "neutral" },
  { id: "C1", label: "C1 · Maîtrise", tone: "purple" },
  { id: "C2", label: "C2 · Circulation", tone: "blue" },
  { id: "Manœuvres", label: "Manœuvres", tone: "green" },
  { id: "Sécurité", label: "Sécurité", tone: "red" },
  { id: "review", label: "À revoir", tone: "red" },
] as const;
const groupTone = (group: Course["group"]): Tone =>
  group === "C1"
    ? "purple"
    : group === "C2"
      ? "blue"
      : group === "Manœuvres"
        ? "green"
        : "red";
export function Pedagogy() {
  const app = useApp();
  const userId = app.profile!.id;
  const published=usePublishedCourses(productTransport,true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("Tous");
  const learning=useProductLearning(userId,productClient,nativeReadingStorage);
  const {reading,loading,busy:saving}=learning;
  const [view,setView]=useState("lessons");
  const [selected, setSelected] = useState<Course | null>(null);
  const reader = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const reduced = useReducedMotion();
  const visible = useMemo(
    () =>
      courses.filter(
        (c) =>
          (filter === "Tous" ||
            (filter === "review"
              ? reading[c.id]?.review
              : c.group === filter)) &&
          normalizeSearch(`${c.title} ${c.tags.join(" ")} ${c.code}`).includes(
            normalizeSearch(search),
          ),
      ),
    [filter, search, reading, JSON.stringify(published)],
  );
  const readCount = courses.filter((c) => reading[c.id]?.read).length;
  const nextCourse = courses.find((c) => !reading[c.id]?.read) || courses[0]!;
  async function update(course:Course,patch:{read?:boolean;review?:boolean}) {await learning.update(course.id,patch);}
  function open(course: Course) {
    setSelected(course);
    reader.current?.scrollTo({ y: 0, animated: false });
  }
  useEffect(()=>{setSelected(previous=>previous?published.find(c=>c.id===previous.id)||null:null);},[JSON.stringify(published)]);
  const nextIndex = selected
    ? courses.findIndex((c) => c.id === selected.id) + 1
    : 0;
  return (
    <>
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 5 }}>
          <Text style={s.eyebrow}>LE REPÈRE · APPRENDRE</Text>
          <Text style={s.title}>Fiches pédagogiques</Text>
          <Text style={s.subtitle}>
            Comprendre la situation. Savoir quoi faire.
          </Text>
        </View>
        <View
          style={[
            s.card,
            {
              backgroundColor: colors.wine,
              borderColor: colors.wine,
              padding: 22,
              gap: 14,
            },
          ]}
        >
          <View style={s.between}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#F1D6DD",
                letterSpacing: 1,
              }}
            >
              TA PROCHAINE FICHE
            </Text>
            <Text style={{ fontSize: 12, color: "#F1D6DD" }}>
              {nextCourse.minutes} min
            </Text>
          </View>
          <Text
            style={{
              fontSize: 23,
              lineHeight: 29,
              fontWeight: "600",
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            {nextCourse.title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lire ${nextCourse.title}`}
            onPress={() => open(nextCourse)}
            style={({ pressed }) => ({
              minHeight: 44,
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
              Lire la fiche
            </Text>
            <Icon name="arrow-forward" size={18} color="white" />
          </Pressable>
          <View
            style={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "#8C5263",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 4,
                width: `${(100 * readCount) / courses.length}%`,
                backgroundColor: "#F5E8CE",
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: "#F1D6DD" }}>
            {readCount} / {courses.length} fiches lues · progression synchronisée sur cet
            iPhone
          </Text>
        </View>
        <Field
          label="Rechercher une fiche"
          value={search}
          onChangeText={setSearch}
          placeholder="Priorité, volant, créneau…"
          autoCorrect={false}
          returnKeyType="search"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {groups.map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              tone={g.tone}
              active={filter === g.id}
              onPress={() => setFilter(g.id)}
            />
          ))}
        </ScrollView>
        <View style={s.between}>
          <Text style={s.heading}>
            {filter === "review"
              ? "À revoir"
              : filter === "Tous"
                ? "Toutes les fiches"
                : groups.find((g) => g.id === filter)?.label}
          </Text>
          <Text style={s.caption}>{visible.length} fiches</Text>
        </View>
        {loading && <ActivityIndicator color={colors.wine} />}
        {!visible.length && (
          <Empty
            title="Aucune fiche trouvée"
            description={
              filter === "review"
                ? "Marque une fiche « À revoir » pendant ta lecture pour la retrouver ici."
                : "Essaie un autre mot ou retire le filtre."
            }
          />
        )}
        {app.profile?.role!=="student"&&<View style={s.row}><Chip label="Les cours" active={view==="lessons"} onPress={()=>setView("lessons")}/><Chip label="Suivi des élèves" active={view==="students"} onPress={()=>setView("students")}/></View>}
        {!!learning.error&&<Text style={s.error} accessibilityRole="alert">{learning.error}</Text>}
        {view==="students"?<TeacherLessons/>:<StudyOverview reading={reading} quizzes={learning.quizzes} plan={learning.plan} choose={id=>open(courses.find(c=>c.id===id)!)}/>}
        {view==="lessons"&&visible.map((course) => {
          const palette = tones[groupTone(course.group)];
          return (
            <Pressable
              key={course.id}
              accessibilityRole="button"
              accessibilityLabel={`${course.code}, ${course.title}, ${course.minutes} minutes${reading[course.id]?.read ? ", lue" : ""}`}
              onPress={() => open(course)}
              style={({ pressed }) => [
                s.card,
                {
                  opacity: pressed ? 0.8 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  padding: 16,
                },
              ]}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: palette.soft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: palette.ink,
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {course.code}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[s.body, { fontWeight: "600", fontSize: 16 }]}>
                  {course.title}
                </Text>
                <Text style={s.caption}>
                  {course.group} · {course.minutes} min
                  {reading[course.id]?.read ? " · Lue" : ""}
                  {reading[course.id]?.review ? " · À revoir" : ""}
                </Text>
              </View>
              <Icon
                name={
                  reading[course.id]?.read
                    ? "checkmark-circle"
                    : "chevron-forward"
                }
                size={20}
                color={
                  reading[course.id]?.review
                    ? colors.red
                    : reading[course.id]?.read
                      ? colors.green
                      : colors.muted
                }
              />
            </Pressable>
          );
        })}
        <Text style={s.caption}>
          Des explications issues des fiches de ton enseignant, adaptées à la
          lecture sur téléphone. La lecture ne vaut pas validation d’une
          compétence de conduite.
        </Text>
      </ScrollView>
      <Modal
        visible={!!selected}
        presentationStyle="fullScreen"
        animationType={reduced ? "fade" : "slide"}
        onRequestClose={() => setSelected(null)}
      >
        <ModalFrame>
          {selected && (
            <>
              <View
                style={[
                  s.between,
                  {
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderColor: colors.line,
                  },
                ]}
              >
                <Text style={[s.eyebrow, { flex: 1 }]}>
                  {selected.group} · {selected.code} · {selected.minutes} MIN
                </Text>
                <IconButton
                  name="close"
                  label="Fermer la fiche"
                  onPress={() => setSelected(null)}
                />
              </View>
              <ScrollView
                ref={reader}
                contentContainerStyle={[s.content, { paddingBottom: 36 }]}
              >
                <Text selectable style={s.title}>
                  {selected.title}
                </Text>
                <Text
                  selectable
                  style={[s.body, { fontSize: 17, lineHeight: 27 }]}
                >
                  {selected.intro}
                </Text>
                <View
                  style={[
                    s.card,
                    {
                      backgroundColor: tones[groupTone(selected.group)].soft,
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.label,
                      {
                        fontWeight: "700",
                        color: tones[groupTone(selected.group)].ink,
                      },
                    ]}
                  >
                    L’objectif
                  </Text>
                  <Text selectable style={s.body}>
                    {selected.objective}
                  </Text>
                </View>
                {selected.steps.map((step, index) => (
                  <View key={step.title} style={{ gap: 10, paddingTop: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: colors.wine,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: "700",
                          }}
                        >
                          {index + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          s.heading,
                          { flex: 1, fontSize: 20, lineHeight: 26 },
                        ]}
                      >
                        {step.title}
                      </Text>
                    </View>
                    <Text
                      selectable
                      style={[s.body, { fontSize: 16, lineHeight: 26 }]}
                    >
                      {step.explanation}
                    </Text>
                    <Text
                      selectable
                      style={[s.muted, { fontSize: 14, lineHeight: 23 }]}
                    >
                      Pourquoi ? {step.why}
                    </Text>
                    <View style={[s.line, { marginTop: 8 }]} />
                  </View>
                ))}
                <View
                  style={[
                    s.card,
                    {
                      backgroundColor: colors.blueSoft,
                      borderColor: colors.blueSoft,
                    },
                  ]}
                >
                  <Text
                    style={[s.label, { color: colors.blue, fontWeight: "700" }]}
                  >
                    Concrètement, sur la route
                  </Text>
                  <Text selectable style={s.body}>
                    {selected.example}
                  </Text>
                </View>
                <Text style={s.heading}>Les erreurs à éviter</Text>
                {selected.traps.map((text) => (
                  <View
                    key={text}
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <Icon
                      name="remove-circle-outline"
                      size={18}
                      color={colors.red}
                    />
                    <Text selectable style={[s.body, { flex: 1 }]}>
                      {text}
                    </Text>
                  </View>
                ))}
                <View
                  style={[
                    s.card,
                    {
                      backgroundColor: colors.redSoft,
                      borderColor: colors.redSoft,
                      borderLeftWidth: 4,
                      borderLeftColor: colors.red,
                    },
                  ]}
                >
                  <View style={s.row}>
                    <Icon name="warning-outline" color={colors.red} />
                    <Text
                      style={{
                        color: colors.red,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
                      Le point de vigilance
                    </Text>
                  </View>
                  <Text selectable style={s.body}>
                    {selected.safety}
                  </Text>
                </View>
                <View style={s.card}>
                  <Text style={s.eyebrow}>À RETENIR</Text>
                  <Text selectable style={[s.heading, { lineHeight: 29 }]}>
                    {selected.takeaway}
                  </Text>
                </View>
                <Button
                  label={
                    reading[selected.id]?.read
                      ? "Fiche lue · marquer non lue"
                      : "J’ai lu cette fiche"
                  }
                  icon={
                    reading[selected.id]?.read
                      ? "checkmark-circle-outline"
                      : "checkmark"
                  }
                  busy={saving}
                  onPress={() =>
                    void update(selected, { read: !reading[selected.id]?.read })
                  }
                />
                <Chip
                  label={
                    reading[selected.id]?.review
                      ? "À revoir · sélectionné"
                      : "À revoir"
                  }
                  tone="red"
                  active={reading[selected.id]?.review}
                  onPress={() =>
                    void update(selected, {
                      review: !reading[selected.id]?.review,
                    })
                  }
                />
                <LessonQuiz key={selected.id} course={selected} onChanged={()=>void learning.refresh()}/>
                {nextIndex < courses.length && (
                  <Button
                    secondary
                    label="Fiche suivante"
                    icon="arrow-forward"
                    onPress={() => open(courses[nextIndex]!)}
                  />
                )}
                <Button secondary label={selected.video.title} onPress={()=>void Linking.openURL(selected.video.url)}/>
                <Text style={s.caption}>{selected.videoNote||selected.video.channel}</Text>
                <Text style={s.caption}>{selected.sourcePages}</Text>
                {selected.group === "Sécurité" || selected.id === "c2-pietons"
                  ? Object.values(courseSources).map((source) => (
                      <Pressable
                        key={source.url}
                        accessibilityRole="link"
                        onPress={() =>
                          void Linking.openURL(source.url).catch(() =>
                            app.setMessage("Impossible d’ouvrir la référence."),
                          )
                        }
                        style={{ minHeight: 44, justifyContent: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.blue,
                            textDecorationLine: "underline",
                          }}
                        >
                          {source.label}
                        </Text>
                      </Pressable>
                    ))
                  : null}
              </ScrollView>
            </>
          )}
        </ModalFrame>
      </Modal>
    </>
  );
}
