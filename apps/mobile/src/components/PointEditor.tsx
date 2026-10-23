import { StreetViewButton } from "./StreetViewButton";
import { ModalFrame } from "./ModalFrame";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  Switch,
  Text,
  View,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import {
  categories,
  nearestFix,
  type Point,
  type MapSpot,
  type Fix,
} from "@repere/core";
import { Button, Chip, Field, Sheet, Icon } from "./UI";
import { colors, styles as s } from "../theme";
import { useApp } from "../state";
import { request } from "../services/auth";
import { SpotLesson } from "./SpotLesson";
import { PhotoGallery } from "./PhotoGallery";
import {
  getLocal,
  putLocalRoute,
  upsertPoint,
  deletePoint,
  routeInput,
  pendingAction,
} from "../services/local";
type Target = {
  lat: number;
  lng: number;
  point?: Point | MapSpot;
  routeId?: string;
  fixes?: Fix[];
};
export function PointEditor({
  target,
  onClose,
}: {
  target: Target | null;
  onClose: () => void;
}) {
  const app = useApp();
  const [name, setName] = useState(""),
    [category, setCategory] =
      useState<(typeof categories)[number]>("Intersection"),
    [note, setNote] = useState(""),
    [question, setQuestion] = useState(""),
    [options, setOptions] = useState(["Oui", "Non"]),
    [answer, setAnswer] = useState(0),
    [validated, setValidated] = useState(false),
    [photos, setPhotos] = useState<Point["photos"]>([]),
    [shared, setShared] = useState(true),
    [loadingPhotos, setLoadingPhotos] = useState(false),
    [photoLoadFailed, setPhotoLoadFailed] = useState(false),
    [photoRetry, setPhotoRetry] = useState(0),
    [photoIndex, setPhotoIndex] = useState(-1),
    [quizVersion, setQuizVersion] = useState<number | undefined>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!target) return;
    const p = target.point;
    setName(p?.name || "");
    setCategory(
      categories.includes(p?.category as any) ? p!.category : "Intersection",
    );
    setNote(
      p && "note" in p
        ? p.note
        : p && "explanation" in p
          ? p.explanation || ""
          : "",
    );
    const quiz = p && "quiz" in p ? p.quiz : null;
    setQuestion(quiz?.question || (p && "question" in p ? p.question : ""));
    setOptions(
      quiz?.options || (p && "options" in p ? p.options : ["Oui", "Non"]),
    );
    setAnswer(quiz?.answer ?? (p && "answer" in p ? p.answer || 0 : 0));
    setValidated(!!quiz || (p && "validated" in p ? p.validated : false));
    setPhotos(p && "photos" in p ? p.photos || [] : []);
    setShared(
      p
        ? ("status" in p && p.status === "published") || !!p.shareWithStudents
        : true,
    );
    setQuizVersion(p && "quizVersion" in p ? p.quizVersion : undefined);
    setError("");
    setPhotoIndex(-1);
  }, [target]);
  useEffect(() => {
    const p = target?.point;
    setPhotoLoadFailed(false);
    if (!p || !("authorId" in p)) {
      setLoadingPhotos(false);
      return;
    }
    let alive = true;
    setLoadingPhotos(true);
    request<MapSpot>(`/v1/spots/${p.id}`)
      .then((detail) => {
        if (alive) {
          setError("");
          setPhotos(detail.photos || []);
          setQuizVersion(detail.quizVersion);
          setName(detail.name);
          setCategory(detail.category);
          setNote(detail.quiz?.explanation || detail.note);
          setQuestion(detail.quiz?.question || "");
          setOptions(detail.quiz?.options || ["Oui", "Non"]);
          setAnswer(detail.quiz?.answer ?? 0);
          setValidated(!!detail.quiz);
          setShared(
            detail.status === "published" || !!detail.shareWithStudents,
          );
        }
      })
      .catch(() => {
        if (alive) {
          setPhotoLoadFailed(true);
          setError(
            "Impossible de charger les photos. Réessayez avant d’enregistrer.",
          );
        }
      })
      .finally(() => {
        if (alive) setLoadingPhotos(false);
      });
    return () => {
      alive = false;
    };
  }, [target, photoRetry]);
  const routeId = target?.routeId;
  async function ensureRoute() {
    if (!routeId || !app.profile) return;
    const existing = await getLocal(routeId);
    if (existing) return;
    if (app.selected?.id === routeId)
      await putLocalRoute(app.profile.id, app.selected);
    else throw new Error("Parcours introuvable.");
  }
  async function photo(source: "camera" | "library") {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted)
        throw new Error("Autorisez l’accès à la photo dans les réglages.");
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.75,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.75,
            });
      if (result.canceled) return;
      let image: Awaited<ReturnType<typeof manipulateAsync>> | null = null;
      for (const [width, quality] of [
        [2048, 0.85],
        [1600, 0.8],
        [1200, 0.72],
      ]) {
        image = await manipulateAsync(
          result.assets[0]!.uri,
          [
            {
              resize: {
                width: Math.min(result.assets[0]!.width || width!, width!),
              },
            },
          ],
          { compress: quality, format: SaveFormat.JPEG, base64: true },
        );
        if (image.base64 && image.base64.length <= 1_350_000) break;
      }
      if (!image?.base64 || image.base64.length > 1_350_000)
        throw new Error("Photo trop lourde. Choisissez une autre image.");
      setPhotos((p) => [
        ...p,
        {
          id: Crypto.randomUUID(),
          dataUrl: `data:image/jpeg;base64,${image!.base64}`,
          width: image!.width,
          height: image!.height,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Photographie indisponible.");
    }
  }
  async function save() {
    if (!target || !app.profile) return;
    setBusy(true);
    setError("");
    try {
      if (!name.trim()) throw new Error("Donnez un nom à ce repère.");
      if (loadingPhotos || photoLoadFailed)
        throw new Error("Chargez les photos avant d’enregistrer.");
      if ((shared || validated) && !app.config?.learningEnabled)
        throw new Error(
          "Le partage pédagogique n’est pas encore disponible. Réessayez après synchronisation.",
        );
      if (
        validated &&
        (!question.trim() ||
          !note.trim() ||
          options.some((o) => !o.trim()) ||
          answer >= options.length ||
          new Set(options.map((o) => o.trim().toLocaleLowerCase("fr"))).size !==
            options.length)
      )
        throw new Error(
          "Complétez la question, des réponses différentes et la correction.",
        );
      if (
        !routeId &&
        (photos.length > 0 || shared) &&
        !app.config?.spotPhotosEnabled
      )
        throw new Error(
          "Le serveur doit être mis à jour pour conserver les photos et partager les repères. Votre saisie reste ouverte.",
        );
      await ensureRoute();
      const id = target.point?.id || Crypto.randomUUID();
      if (routeId) {
        if (
          validated &&
          (!question.trim() || !note.trim() || options.some((o) => !o.trim()))
        )
          throw new Error(
            "Complétez la question, les réponses et l’explication avant validation.",
          );
        const local = await getLocal(routeId);
        const fixes = local?.fixes || target.fixes || [];
        const p: Point = {
          id,
          name: name.trim(),
          category,
          lat: target.lat,
          lng: target.lng,
          fixIndex: nearestFix(fixes, target),
          question: question.trim(),
          options,
          answer,
          explanation: note.trim(),
          validated,
          shareWithStudents: shared,
          photos,
        };
        await upsertPoint(app.profile.id, p, routeId);
        if (shared || app.spots.some((spot) => spot.id === id)) {
          await pendingAction(app.profile.id, `/v1/spots/${id}/save`, {
            id,
            name: p.name,
            category,
            lat: p.lat,
            lng: p.lng,
            note: p.explanation || "",
            photos,
            status: shared ? "published" : "private",
            shareWithStudents: shared,
            sourceRouteId: routeId,
            quiz: validated
              ? {
                  question: p.question,
                  options: p.options,
                  answer,
                  explanation: note.trim(),
                }
              : null,
          });
        }
      } else {
        const p: MapSpot = {
          id,
          name: name.trim(),
          category,
          lat: target.lat,
          lng: target.lng,
          note: note.trim(),
          status: shared ? "published" : "private",
          quiz: validated
            ? {
                question: question.trim(),
                options: options.map((o) => o.trim()),
                answer,
                explanation: note.trim(),
              }
            : null,
          quizVersion,
          sourceRouteId:
            target.point && "sourceRouteId" in target.point
              ? target.point.sourceRouteId
              : undefined,
          photos,
          shareWithStudents: shared,
          authorId: app.profile.id,
        };
        await upsertPoint(app.profile.id, p);
        if (p.sourceRouteId) {
          const source = await getLocal(p.sourceRouteId);
          const previous = source?.points.find((point) => point.id === id);
          if (previous)
            await upsertPoint(
              app.profile.id,
              {
                ...previous,
                name: p.name,
                category,
                photos,
                question: question.trim(),
                options,
                answer,
                explanation: note.trim(),
                validated,
                shareWithStudents: shared,
              },
              p.sourceRouteId,
            );
        }
      }
      await app.reloadLocal();
      onClose();
      void app.sync();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }
  if (target && loadingPhotos)
    return (
      <Sheet visible onClose={onClose} title="Votre repère">
        {target && <StreetViewButton position={target} title={target.point?.name || "Repère"} kind="point" />}
        <Text accessibilityRole="status" style={s.muted}>
          Chargement du repère et des photographies…
        </Text>
      </Sheet>
    );
  return (
    <Sheet
      visible={!!target}
      onClose={onClose}
      title={target?.point ? "Votre repère" : "Un nouveau repère"}
    >
      {target && <StreetViewButton key={target.point?.id || "new-point"} position={target} title={target.point?.name || "Repère"} kind="point" />}
      <Text style={s.muted}>
        Position choisie sur la carte · {target?.lat.toFixed(5)},{" "}
        {target?.lng.toFixed(5)}
      </Text>
      <Field
        label="Nom du repère"
        value={name}
        onChangeText={setName}
        placeholder="Ex. Priorité à droite peu visible"
        maxLength={120}
      />
      <Text style={s.label}>Catégorie</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>
      <View style={s.card}>
        <View style={s.between}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={s.body}>Tous les élèves</Text>
            <Text style={s.caption}>
              {shared
                ? "Visible sur la carte de tous les élèves connectés, avec ses photos et son quiz."
                : "Repère privé. Activez le partage pour le rendre visible aux élèves."}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Partager ce repère avec tous les élèves"
            value={shared}
            onValueChange={setShared}
            trackColor={{ true: colors.wine, false: colors.line }}
          />
        </View>
      </View>
      <View style={s.card}>
        <View style={s.between}>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={s.heading}>Une question pour apprendre</Text>
            <Text style={s.caption}>
              Facultatif · La correction apparaît après la réponse.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Activer le quiz du repère"
            value={validated}
            onValueChange={setValidated}
            trackColor={{ true: colors.wine, false: colors.line }}
          />
        </View>
        {validated && (
          <>
            <Field
              label="Votre question"
              value={question}
              onChangeText={setQuestion}
              multiline
              maxLength={1000}
              placeholder="Que faut-il observer avant de s’engager ?"
            />
            <Text style={s.caption}>Cochez la bonne réponse.</Text>
            {options.map((option, i) => (
              <View key={i} style={s.row}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityLabel={`Bonne réponse : choix ${i + 1}`}
                  accessibilityState={{ checked: answer === i }}
                  onPress={() => setAnswer(i)}
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name={answer === i ? "radio-button-on" : "radio-button-off"}
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Field
                    label={`Choix ${i + 1}`}
                    value={option}
                    onChangeText={(text) =>
                      setOptions((a) => a.map((o, n) => (n === i ? text : o)))
                    }
                    maxLength={300}
                  />
                </View>
                {options.length > 2 && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Retirer le choix ${i + 1}`}
                    onPress={() => {
                      setOptions((a) => a.filter((_, n) => n !== i));
                      setAnswer(0);
                    }}
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon name="remove-circle-outline" />
                  </Pressable>
                )}
              </View>
            ))}
            {options.length < 6 && (
              <Button
                label="Ajouter un choix"
                secondary
                onPress={() => setOptions((a) => [...a, ""])}
              />
            )}
          </>
        )}
      </View>
      <Field
        label={validated ? "Correction et explication" : "À observer ici"}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={3000}
        placeholder={
          validated
            ? "Pourquoi cette réponse est-elle la bonne ?"
            : "Les indices et les conseils pour vos élèves…"
        }
      />
      {loadingPhotos && <Text style={s.caption}>Chargement des photos…</Text>}
      {photoLoadFailed && (
        <Button
          label="Réessayer le chargement"
          secondary
          onPress={() => setPhotoRetry((n) => n + 1)}
        />
      )}
      <Text style={s.label}>Photographies · {photos.length}/6</Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {photos.map((ph, index) => (
          <Pressable
            key={ph.id}
            accessibilityRole="button"
            accessibilityLabel={`Agrandir la photo ${index + 1}`}
            onPress={() => setPhotoIndex(index)}
            onLongPress={() =>
              Alert.alert("Retirer la photo ?", "", [
                { text: "Annuler" },
                {
                  text: "Retirer",
                  style: "destructive",
                  onPress: () =>
                    setPhotos((a) => a.filter((x) => x.id !== ph.id)),
                },
              ])
            }
          >
            <Image
              source={{ uri: ph.dataUrl }}
              style={{ width: 85, height: 85, borderRadius: 15 }}
            />
          </Pressable>
        ))}
      </View>
      {photos.length < 6 && (
        <Button
          label="Ajouter une photographie"
          icon="camera-outline"
          secondary
          onPress={() =>
            Alert.alert("Ajouter une photo", "", [
              {
                text: "Appareil photo",
                onPress: () => void photo("camera"),
              },
              { text: "Photothèque", onPress: () => void photo("library") },
              { text: "Annuler", style: "cancel" },
            ])
          }
        />
      )}

      <PhotoGallery
        title={name || "Votre repère"}
        photos={photos}
        index={photoIndex}
        onIndex={setPhotoIndex}
        onClose={() => setPhotoIndex(-1)}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
      <Button
        label="Enregistrer le repère"
        icon="checkmark"
        onPress={() => void save()}
        busy={busy}
        disabled={loadingPhotos || photoLoadFailed}
      />
      {target?.point && (
        <Button
          label="Supprimer ce repère"
          danger
          secondary
          onPress={() =>
            Alert.alert("Supprimer ce repère ?", "", [
              { text: "Annuler" },
              {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                  if (!app.profile || !target?.point || busy) return;
                  setBusy(true);
                  setError("");
                  try {
                    await ensureRoute();
                    await deletePoint(app.profile.id, target.point, routeId);
                    const sourceId =
                      "sourceRouteId" in target.point
                        ? target.point.sourceRouteId
                        : undefined;
                    if (!routeId && sourceId) {
                      const source = await getLocal(sourceId);
                      const sourcePoint = source?.points.find(
                        (p) => p.id === target.point!.id,
                      );
                      if (sourcePoint)
                        await deletePoint(
                          app.profile.id,
                          sourcePoint,
                          sourceId,
                        );
                    }
                    await pendingAction(
                      app.profile!.id,
                      `/v1/spots/${target.point!.id}/archive`,
                      {
                        spot: {
                          id: target.point.id,
                          name: target.point.name,
                          category: target.point.category,
                          lat: target.point.lat,
                          lng: target.point.lng,
                          note: "",
                          status: shared ? "published" : "private",
                          shareWithStudents: shared,
                          sourceRouteId: routeId || sourceId,
                        },
                      },
                    );
                    await app.reloadLocal();
                    onClose();
                    void app.sync();
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Suppression impossible. Réessayez.",
                    );
                  } finally {
                    setBusy(false);
                  }
                },
              },
            ])
          }
          disabled={busy}
        />
      )}
    </Sheet>
  );
}
export function PointReader({
  point,
  onClose,
}: {
  point: Point | MapSpot | null;
  onClose: () => void;
}) {
  return (
    <Sheet visible={!!point} onClose={onClose} title={point?.name || "Repère"}>
      <PointDetails point={point} />
      <Button label="Fermer" secondary onPress={onClose} />
    </Sheet>
  );
}

export function PointDetails({ point }: { point: Point | MapSpot | null }) {
  const app = useApp();
  const catalog = point ? app.spots.find((spot) => spot.id === point.id) : null;
  if (point && ("authorId" in point || catalog))
    return (
      <SpotLesson key={point.id} initial={catalog || (point as MapSpot)} />
    );
  return <RoutePointDetails key={point?.id || "empty"} point={point} />;
}
function RoutePointDetails({ point }: { point: Point | MapSpot | null }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  return (
    <>
      <Text style={s.eyebrow}>{point?.category}</Text>
      {point && (
        <StreetViewButton
          key={point.id}
          title={point.name}
          position={point}
          kind="point"
        />
      )}

      {point &&
        "photos" in point &&
        (point.photos || []).map((ph) => (
          <Pressable
            key={ph.id}
            accessibilityRole="button"
            accessibilityLabel="Agrandir la photo du repère"
            onPress={() => setPhotoUri(ph.dataUrl)}
          >
            <Image
              source={{ uri: ph.dataUrl }}
              style={{ width: "100%", height: 220, borderRadius: 20 }}
              resizeMode="contain"
            />
            <Text style={s.caption}>
              Touchez pour agrandir · pincez pour zoomer
            </Text>
          </Pressable>
        ))}
      <Text style={s.body}>
        {point && ("note" in point ? point.note : point.question)}
      </Text>
      <Text style={s.caption}>
        Les panneaux se consultent dans les photos ou les panoramas disponibles.
        Leur date peut différer de la situation actuelle.
      </Text>
      <Modal
        visible={!!photoUri}
        animationType="fade"
        onRequestClose={() => setPhotoUri(null)}
      >
        <ModalFrame>
          <Button
            secondary
            label="Fermer la photo"
            onPress={() => setPhotoUri(null)}
          />
          <ScrollView
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          >
            {photoUri && (
              <Image
                accessibilityLabel="Photo du repère, zoom possible"
                source={{ uri: photoUri }}
                style={{ width, height: Math.max(200, height - 180) }}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </ModalFrame>
      </Modal>
    </>
  );
}
