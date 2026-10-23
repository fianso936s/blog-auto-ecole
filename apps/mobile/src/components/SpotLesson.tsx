import { ContentSafety } from "./ContentSafety";
import { StreetViewButton } from "./StreetViewButton";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as Crypto from "expo-crypto";
import type { MapSpot } from "@repere/core";
import { useApp } from "../state";
import { request } from "../services/auth";
import { pendingAction } from "../services/local";
import { colors, styles as s } from "../theme";
import { Button, Icon } from "./UI";
import { PhotoGallery } from "./PhotoGallery";

type Correction = {
  correct: boolean;
  answer: number;
  explanation: string;
  version: number;
};
export function SpotLesson({ initial }: { initial: MapSpot }) {
  const app = useApp(),
    student = app.profile?.role === "student";
  const [point, setPoint] = useState(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [photo, setPhoto] = useState(-1),
    [choice, setChoice] = useState<number | null>(null),
    [result, setResult] = useState<Correction | null>(null),
    [busy, setBusy] = useState(false),
    [quizError, setQuizError] = useState("");
  const opened = useRef(false),
    seenPhotos = useRef(new Set<string>()),
    attempt = useRef<{ id: string; answer: number } | null>(null);
  const activity = useCallback(
    async (kind: "opened" | "photo_viewed", photoId?: string) => {
      if (!app.profile || app.profile.role !== "student") return;
      const body = {
        eventId: Crypto.randomUUID(),
        kind,
        ...(photoId ? { photoId } : {}),
      };
      const path = `/v1/spots/${initial.id}/activity`;
      try {
        await request(path, { method: "POST", body: JSON.stringify(body) });
      } catch {
        await pendingAction(app.profile.id, path, body, body.eventId).catch(
          () => {},
        );
      }
    },
    [app.profile?.id, app.profile?.role, initial.id],
  );
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    request<MapSpot>(`/v1/spots/${initial.id}`)
      .then((detail) => {
        if (!alive) return;
        setPoint(detail);
        if (!opened.current) {
          opened.current = true;
          void activity("opened");
        }
      })
      .catch((e) => {
        if (alive)
          setError(
            e instanceof Error ? e.message : "Impossible de charger ce repère.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [initial.id, retry, activity]);
  const viewed = useCallback(
    (id: string) => {
      if (seenPhotos.current.has(id)) return;
      seenPhotos.current.add(id);
      void activity("photo_viewed", id);
    },
    [activity],
  );
  async function answer() {
    if (choice === null || !point.quiz || !point.quizVersion || busy) return;
    setBusy(true);
    setQuizError("");
    if (!attempt.current || attempt.current.answer !== choice)
      attempt.current = { id: Crypto.randomUUID(), answer: choice };
    try {
      setResult(
        await request<Correction>(`/v1/spots/${point.id}/quiz`, {
          method: "POST",
          body: JSON.stringify({
            attemptId: attempt.current.id,
            version: point.quizVersion,
            answer: choice,
          }),
        }),
      );
    } catch (e) {
      setQuizError(
        e instanceof Error
          ? e.message
          : "Connexion nécessaire pour corriger et enregistrer votre réponse.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <Text accessibilityRole="status" style={s.muted}>
        Chargement du repère et des photographies…
      </Text>
    );
  if (error)
    return (
      <View style={{ gap: 14 }}>
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
        <Button
          label="Réessayer"
          secondary
          onPress={() => setRetry((n) => n + 1)}
        />
      </View>
    );
  return (
    <View style={{ gap: 18 }}>
      <StreetViewButton
        key={point.id}
        title={point.name}
        position={point}
        kind="point"
      />

      <Text style={s.eyebrow}>
        {point.category} ·{" "}
        {point.status === "published"
          ? "Partagé avec tous les élèves"
          : "Partage de votre enseignant"}
      </Text>
      {(point.photos || []).map((ph, index) => (
        <Pressable
          key={ph.id}
          accessibilityRole="button"
          accessibilityLabel={`Ouvrir la photographie ${index + 1} en plein écran`}
          onPress={() => setPhoto(index)}
          style={{ gap: 8 }}
        >
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: colors.soft,
            }}
          >
            <Image
              source={{ uri: ph.dataUrl }}
              accessibilityLabel={
                ph.caption || `Photographie du repère ${point.name}`
              }
              resizeMode="contain"
              style={{ width: "100%", height: 280 }}
            />
          </View>
          <Text style={s.caption}>
            {ph.caption || `Photo ${index + 1}`} · Touchez pour ouvrir et zoomer
          </Text>
        </Pressable>
      ))}
      {!point.photos?.length && (
        <Text style={s.caption}>
          Votre enseignant peut ajouter des photos à ce repère.
        </Text>
      )}
      {!point.quiz && !!point.note && (
        <View style={s.card}>
          <Text style={s.heading}>À observer ici</Text>
          <Text style={s.body}>{point.note}</Text>
        </View>
      )}
      {point.quiz && (
        <View style={s.card}>
          <Text style={s.eyebrow}>
            {student ? "À VOUS DE JOUER" : "QUESTION PROPOSÉE AUX ÉLÈVES"}
          </Text>
          <Text style={s.heading}>{point.quiz.question}</Text>
          {point.quiz.options.map((option, index) => {
            const checked = choice === index;
            const good =
              result?.answer === index ||
              (!student && point.quiz?.answer === index);
            return (
              <Pressable
                key={index}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{
                  checked,
                  disabled: !!result || busy || !student,
                }}
                disabled={!!result || busy || !student}
                onPress={() => {
                  if (choice !== index) attempt.current = null;
                  setChoice(index);
                  setQuizError("");
                }}
                style={{
                  minHeight: 56,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: good || checked ? 2 : 1,
                  borderColor: good
                    ? colors.green
                    : checked
                      ? colors.wine
                      : colors.line,
                  backgroundColor: good ? "#E8F2ED" : colors.paper,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Icon
                  name={
                    good
                      ? "checkmark-circle"
                      : checked
                        ? "radio-button-on"
                        : "radio-button-off"
                  }
                  color={good ? colors.green : colors.wine}
                />
                <Text style={[s.body, { flex: 1 }]}>{option}</Text>
              </Pressable>
            );
          })}
          {student && !result && (
            <Button
              label="Valider ma réponse"
              disabled={choice === null}
              busy={busy}
              onPress={() => void answer()}
            />
          )}
          {!!quizError && (
            <Text accessibilityRole="alert" style={s.error}>
              {quizError}
            </Text>
          )}
          {result && (
            <View accessibilityRole="summary" style={{ gap: 10 }}>
              <Text
                style={[
                  s.heading,
                  { color: result.correct ? colors.green : colors.red },
                ]}
              >
                {result.correct ? "Bonne réponse" : "À revoir ensemble"}
              </Text>
              <Text style={s.body}>{result.explanation}</Text>
              <Text style={s.caption}>
                Réponse enregistrée dans votre progression.
              </Text>
              <Button
                label="Répondre à nouveau"
                secondary
                onPress={() => {
                  setResult(null);
                  setChoice(null);
                  attempt.current = null;
                }}
              />
            </View>
          )}
          {!student && !!point.quiz.explanation && (
            <Text style={s.body}>{point.quiz.explanation}</Text>
          )}
        </View>
      )}
      <ContentSafety kind="spot" id={point.id} authorId={point.authorId} />
      <PhotoGallery
        title={point.name}
        photos={point.photos || []}
        index={photo}
        onIndex={setPhoto}
        onClose={() => setPhoto(-1)}
        onViewed={viewed}
      />
    </View>
  );
}
