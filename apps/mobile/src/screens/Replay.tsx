import { replayBearing } from "../services/route-viewport";
import { ContentSafety } from "../components/ContentSafety";
import { MapModeBar } from "../components/MapModeBar";
import { ModalFrame } from "../components/ModalFrame";
import { StreetViewButton } from "../components/StreetViewButton";
import { StreetPane } from "../components/StreetPane";
import { PointReader } from "../components/PointEditor";
import { PhotoGallery } from "../components/PhotoGallery";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Modal, Text, View, Pressable, AppState, PanResponder } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import * as Crypto from "expo-crypto";
import {
  crossedPoints,
  replayAnchor,
  replayIndices,
  type Route,
  type Point,
} from "@repere/core";
import { useApp } from "../state";
import { Button, Chip, IconButton, Segmented, Sheet } from "../components/UI";
import { RouteMap } from "../components/RouteMap";
import { colors, styles as s } from "../theme";
import { request } from "../services/auth";
import { pendingAction } from "../services/local";
export function Replay({
  route,
  visible,
  onClose,
  initialMode = "map",
}: {
  route: Route;
  visible: boolean;
  onClose: () => void;
  /** Website player modes: "Carte" or "Street View" following the replay. */
  initialMode?: "map" | "street";
}) {
  const app = useApp();
  const [mode, setMode] = useState<"map" | "street">(initialMode);
  useEffect(() => {
    if (visible) setMode(initialMode);
  }, [visible, initialMode]);
  const indices = useMemo(
    () => replayIndices(route.fixes),
    [route.id, route.version],
  );
  const [index, setIndex] = useState(
    Math.min(route.progress || 0, Math.max(0, route.fixes.length - 1)),
  );
  const timelineWidth=useRef(1),timelineCount=useRef(route.fixes.length);timelineCount.current=route.fixes.length;
  const timeline=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,
    onPanResponderGrant:event=>{setPlaying(false);setIndex(Math.round(Math.max(0,Math.min(1,event.nativeEvent.locationX/timelineWidth.current))*Math.max(0,timelineCount.current-1)));},
    onPanResponderMove:event=>{setPlaying(false);setIndex(Math.round(Math.max(0,Math.min(1,event.nativeEvent.locationX/timelineWidth.current))*Math.max(0,timelineCount.current-1)));}
  }),[]);
  const [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1),
    [message, setMessage] = useState("");
  const [inspected, setInspected] = useState<Point | null>(null);
  const [pointsOpen, setPointsOpen] = useState(false);
  const availablePoints = useMemo(() => route.points.filter(point => !app.archivedPointIds.includes(point.id)), [route.points, app.archivedPointIds]);
  function inspect(point: Point) {
    setPlaying(false);
    setPointsOpen(false);
    setInspected(point);
  }
  const [quiz, setQuiz] = useState<Point | null>(null),
    [choice, setChoice] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    answer: number;
    explanation: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false),
    [photoIndex, setPhotoIndex] = useState(-1);
  const [fullscreen, setFullscreen] = useState(true),
    [threeD, setThreeD] = useState(true);
  const seen = useRef(new Set<string>()),
    attemptId = useRef(Crypto.randomUUID()),
    target = useRef(0),
    wasPlaying = useRef(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  const reducedMotion = useReducedMotion();
  const fix = route.fixes[index];
  const [pov,setPov]=useState(true),[overview,setOverview]=useState(false),[recenterKey,setRecenterKey]=useState(0);
  const bearing=useMemo(()=>pov?replayBearing(route.fixes,index):null,[pov,route.fixes,index]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setAppActive(state === "active");
      if (state !== "active") setPlaying(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    setIndex(
      Math.min(route.progress || 0, Math.max(0, route.fixes.length - 1)),
    );
    setPlaying(false);
    seen.current.clear();
    setInspected(null);
    setPointsOpen(false);
  }, [route.id]);
  useEffect(() => {
    if (!visible) {
      setPlaying(false);
      setQuiz(null);
      setInspected(null);
      setPointsOpen(false);
    } else {
      seen.current.clear();
      setMessage("");
    }
  }, [visible, route.id]);
  function move(to: number) {
    to = Math.max(0, Math.min(route.fixes.length - 1, to));
    if (to > index) {
      const q = crossedPoints(availablePoints, index - 1, to, seen.current)[0];
      if (q) {
        target.current = to;
        seen.current.add(q.id);
        setIndex(q.fixIndex);
        setQuiz(q);
        setPhotoIndex(-1);
        setChoice(null);
        setResult(null);
        attemptId.current = Crypto.randomUUID();
        wasPlaying.current = playing;
        setPlaying(false);
        return;
      }
    }
    setIndex(to);
    if (to >= route.fixes.length - 1) setPlaying(false);
  }
  function next() {
    const to = indices.find((i) => i > index);
    if (to === undefined) {
      setPlaying(false);
      return;
    }
    move(to);
  }
  function back() {
    setPlaying(false);
    const prior = [...indices].reverse().find((i) => i < index) ?? 0;
    setIndex(prior);
  }
  useEffect(() => {
    if (!playing || quiz || !visible || !appActive) return;
    const timer = setTimeout(next, 1500 / speed);
    return () => clearTimeout(timer);
  }, [playing, quiz, index, visible, speed, appActive]);
  useEffect(() => {
    if (!visible || !app.profile || !fix) return;
    const timer = setTimeout(() => {
      void pendingAction(app.profile!.id, `/v1/routes/${route.id}/progress`, {
        fixIndex: index,
      }).then(() => app.sync());
    }, 1500);
    return () => clearTimeout(timer);
  }, [visible, index, route.id]);
  async function answer() {
    if (choice === null || !quiz) return;
    setSubmitting(true);
    setMessage("");
    try {
      setResult(
        await request(`/v1/routes/${route.id}/quiz`, {
          method: "POST",
          body: JSON.stringify({
            pointId: quiz.id,
            answer: choice,
            attemptId: attemptId.current,
          }),
        }),
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Reconnectez-vous pour enregistrer votre réponse et voir l’explication.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  function resume() {
    const nextQuiz = crossedPoints(
      availablePoints,
      index - 1,
      target.current,
      seen.current,
    )[0];
    if (nextQuiz) {
      seen.current.add(nextQuiz.id);
      setIndex(nextQuiz.fixIndex);
      setQuiz(nextQuiz);
      setChoice(null);
      setResult(null);
      attemptId.current = Crypto.randomUUID();
      return;
    }
    setQuiz(null);
    setIndex(target.current);
    setPlaying(wasPlaying.current);
  }
  const progress =
    route.fixes.length > 1 ? index / (route.fixes.length - 1) : 0;
  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? "fade" : "slide"}
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <ModalFrame>
        {!fullscreen && (
          <View style={[s.between, { paddingHorizontal: 16, paddingTop: 12 }]}>
            <Text
              numberOfLines={1}
              style={[s.heading, { flex: 1, fontSize: 22 }]}
            >
              {route.name}
            </Text>
            <IconButton
              name="close"
              label="Fermer le replay"
              onPress={onClose}
            />
          </View>
        )}
        <MapModeBar
          mode={threeD ? "3d" : "2d"}
          fullscreen={fullscreen}
          onFullscreen={() => setFullscreen((v) => !v)}
          onMode={(next) => {setOverview(false);setThreeD(next === "3d");setPov(next === "3d");}}
        >
          <Chip label="Repères" active={pointsOpen} onPress={() => { setPlaying(false); setPointsOpen(true); }} />
          {fullscreen && (
            <IconButton
              name="close"
              label="Fermer le replay"
              onPress={onClose}
            />
          )}
        </MapModeBar>
        <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
          <Segmented
            label="Affichage du parcours"
            value={mode}
            onChange={(next) => {
              setPlaying(false);
              setMode(next);
            }}
            options={[
              { id: "map", label: "Carte" },
              { id: "street", label: "Street View" },
            ]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <RouteMap
            threeD={threeD}
            fixes={route.fixes}
            points={availablePoints}
            onPoint={(point) => inspect(point as Point)}
            focus={fix}
            course={bearing}
            navigationMode={pov && threeD && !overview}
            previewMode={overview}
            recenterKey={recenterKey}
            styleUrl={app.config?.mapStyleUrl}
            follow
          />
          {mode === "map" && <View style={{position:"absolute",top:12,left:12,flexDirection:"row",gap:8}}>
            <Chip label="Vue GPS" active={pov&&!overview} onPress={()=>{setOverview(false);setThreeD(true);setPov(true);setRecenterKey(k=>k+1);}} />
            <Chip label="Aperçu" active={overview} onPress={()=>{setOverview(true);setPlaying(false);}} />
            {pov&&<IconButton name="locate-outline" label="Recentrer la vue GPS" onPress={()=>setRecenterKey(k=>k+1)}/>}
          </View>}
          {mode === "street" && visible && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <StreetPane fixes={route.fixes} index={index} active onPause={() => setPlaying(false)} />
            </View>
          )}
        </View>
        <View
          style={{
            paddingHorizontal: 14,
            paddingTop: 8,
            paddingBottom: 8,
            gap: 6,
            backgroundColor: colors.cream,
          }}
        >
          <View style={s.between}>
            <Text numberOfLines={1} style={[s.caption, { flex: 1 }]}>
              {playing ? "Lecture du parcours" : "Parcours en pause"}
            </Text>
            <Text style={s.caption}>{Math.round(progress * 100)} %</Text>
          </View>
          <View
            {...timeline.panHandlers}
            onLayout={event=>{timelineWidth.current=Math.max(1,event.nativeEvent.layout.width);}}
            accessibilityRole="adjustable"
            accessibilityLabel="Position dans le parcours"
            accessibilityActions={[{name:'increment',label:'Avancer'},{name:'decrement',label:'Reculer'}]}
            onAccessibilityAction={event=>{setPlaying(false);setIndex(i=>Math.max(0,Math.min(route.fixes.length-1,i+(event.nativeEvent.actionName==='increment'?1:-1))));}}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(progress * 100),
            }}
            style={{ minHeight:44, paddingVertical:20, backgroundColor: colors.cream }}
          >
            <View
              style={{
                height: 3,
                backgroundColor: colors.wine,
                width: `${Math.round(progress * 100)}%`,
              }}
            />
          </View>
          {!!message && (
            <Text
              numberOfLines={fullscreen ? 2 : undefined}
              accessibilityRole="alert"
              style={s.caption}
            >
              {message}
            </Text>
          )}
          <View style={[s.row, { gap: 8 }]}>
            <View style={{ flex: 1 }}><Button compact secondary label="Retour au départ" onPress={()=>{setPlaying(false);seen.current.clear();setQuiz(null);setIndex(0);void pendingAction(app.profile!.id,`/v1/routes/${route.id}/progress`,{fixIndex:0}).then(()=>app.sync());}}/></View>
            <View style={{ flex: 1 }}><Button compact secondary label="Repère suivant" disabled={!availablePoints.some((p) => p.fixIndex > index)} onPress={()=>{setPlaying(false);const nextPoint=availablePoints.filter((p)=>p.fixIndex>index).sort((a,b)=>a.fixIndex-b.fixIndex)[0];if(nextPoint)move(nextPoint.fixIndex);}}/></View>
          </View>
          <View style={[s.row, { gap: 8 }]}>
            <IconButton
              name="play-back"
              label="Revenir en arrière"
              onPress={back}
            />
            <View style={{ flex: 1 }}>
              <Button
                compact
                label={
                  playing
                    ? "Pause"
                    : index >= route.fixes.length - 1
                      ? "Relire"
                      : "Lire"
                }
                icon={playing ? "pause" : "play"}
                disabled={!route.fixes.length}
                onPress={() => {
                  if (index >= route.fixes.length - 1) {
                    seen.current.clear();
                    setIndex(0);
                    setPlaying(true);
                    return;
                  }
                  setPlaying((value) => !value);
                }}
              />
            </View>
            <IconButton
              name="play-forward"
              label="Position suivante"
              onPress={() => {
                setPlaying(false);
                next();
              }}
            />
            <Chip
              label={`×${speed}`}
              active
              onPress={() =>
                setSpeed((value) => (value === 0.5 ? 1 : value === 1 ? 2 : 0.5))
              }
            />
          </View>
        </View>
        <Sheet visible={pointsOpen} title="Repères du parcours" onClose={() => setPointsOpen(false)}>
          {!availablePoints.length && <Text style={s.muted}>Aucun repère sur ce parcours.</Text>}
          {availablePoints.map(point => <Pressable key={point.id} accessibilityRole="button" accessibilityLabel={`Consulter ${point.name}`} onPress={() => inspect(point)} style={[s.card, {minHeight: 44}]}><Text style={s.heading}>{point.name}</Text><Text style={s.caption}>{point.category}</Text></Pressable>)}
        </Sheet>
        <View style={{paddingHorizontal: 14, paddingBottom: 6}}><ContentSafety kind="route" id={route.id} authorId={route.authorId} onBlocked={onClose}/></View>
        <PointReader point={visible ? inspected : null} onClose={() => setInspected(null)} />
        <Sheet
          visible={!!quiz}
          onClose={() => {
            if (result) resume();
          }}
          title={quiz?.name || "Point pédagogique"}
        >
          <Text style={s.eyebrow}>{quiz?.category}</Text>
          {quiz && (
            <StreetViewButton
              key={quiz.id}
              title={quiz.name}
              position={quiz}
              kind="point"
            />
          )}
          {quiz?.photos.map((photo, index) => (
            <Pressable
              key={photo.id}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir la photo ${index + 1}`}
              onPress={() => setPhotoIndex(index)}
            >
              <Image
                source={{ uri: photo.dataUrl }}
                resizeMode="contain"
                style={{ height: 240, width: "100%", borderRadius: 20 }}
              />
              <Text style={s.caption}>Touchez pour agrandir et zoomer</Text>
            </Pressable>
          ))}
          <PhotoGallery
            title={quiz?.name || "Repère"}
            photos={quiz?.photos || []}
            index={photoIndex}
            onIndex={setPhotoIndex}
            onClose={() => setPhotoIndex(-1)}
          />
          <Text style={s.heading}>{quiz?.question}</Text>
          {quiz?.options.map((option, i) => (
            <Pressable
              key={i}
              disabled={!!result}
              onPress={() => setChoice(i)}
              style={[
                s.card,
                {
                  padding: 16,
                  borderColor: choice === i ? colors.wine : colors.line,
                  backgroundColor:
                    result?.answer === i ? colors.greenSoft : colors.paper,
                },
              ]}
            >
              <View style={s.row}>
                <View
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: choice === i ? colors.wine : colors.line,
                    backgroundColor: choice === i ? colors.wine : colors.paper,
                  }}
                />
                <Text style={[s.body, { flex: 1 }]}>{option}</Text>
              </View>
            </Pressable>
          ))}
          {result ? (
            <View style={s.card}>
              <Text
                style={[
                  s.heading,
                  { color: result.correct ? colors.green : colors.wine },
                ]}
              >
                {result.correct ? "Bien observé." : "Prenons un repère."}
              </Text>
              <Text style={s.body}>{result.explanation}</Text>
              <Text style={s.caption}>
                Explication validée par un enseignant · réponse enregistrée.
              </Text>
              <Button label="Reprendre le parcours" onPress={resume} />
            </View>
          ) : (
            <>
              <Text style={s.caption}>
                La progression est en pause. Choisissez une réponse pour
                consulter l’explication.
              </Text>
              {!!message && (
                <Text accessibilityRole="alert" style={s.error}>
                  {message}
                </Text>
              )}
              <Button
                label="Valider ma réponse"
                disabled={choice === null}
                busy={submitting}
                onPress={() => void answer()}
              />
              <Button
                label="Quitter le replay"
                secondary
                onPress={() => {
                  setQuiz(null);
                  onClose();
                }}
              />
            </>
          )}
        </Sheet>
      </ModalFrame>
    </Modal>
  );
}
