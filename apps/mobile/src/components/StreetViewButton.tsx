import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, Linking, Modal, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useReducedMotion } from "react-native-reanimated";
import { useApp } from "../state";
import { API_URL } from "../config";
import { trace } from "../services/diagnostics";
import {
  captureStreetSnapshot,
  streetSnapshotRequest,
  type SnapshotPosition,
  type StreetSnapshot,
} from "../services/street-snapshot";
import { colors, styles as s } from "../theme";
import { Button, IconButton } from "./UI";
import { ModalFrame } from "./ModalFrame";

export function StreetViewButton({
  position,
  title,
  kind,
  onBeforeOpen,
}: {
  position: SnapshotPosition;
  title: string;
  kind: StreetSnapshot["kind"];
  onBeforeOpen?: () => void;
}) {
  const app = useApp();
  const [snapshot, setSnapshot] = useState<StreetSnapshot | null>(null);
  return (
    <>
      <Button
        label="Voir Street View"
        secondary
        icon="eye-outline"
        onPress={() => {
          if (!app.online) {
            Alert.alert(
              "Street View",
              "Une connexion Internet est nécessaire.",
            );
            return;
          }
          if (!app.config?.streetViewEnabled) {
            Alert.alert(
              "Street View",
              "Les vues de rue sont momentanément indisponibles.",
            );
            return;
          }
          const selected = captureStreetSnapshot(position, kind, title);
          if (!selected) return;
          onBeforeOpen?.();
          setSnapshot(selected);
        }}
      />
      {snapshot && (
        <StreetViewWindow target={snapshot} onClose={() => setSnapshot(null)} />
      )}
    </>
  );
}
function StreetViewWindow({
  target,
  onClose,
}: {
  target: StreetSnapshot;
  onClose: () => void;
}) {
  const web = useRef<WebView<{}>>(null),
    generation = useRef(0),
    pending = useRef<number | null>(null),
    started = useRef(0);
  const [ready, setReady] = useState(false),
    [load, setLoad] = useState(0),
    [error, setError] = useState(""),
    [nearby, setNearby] = useState<number | null>(null);
  const [active, setActive] = useState(AppState.currentState === "active");
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
      setReady(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!active || ready) return;
    const timer = setTimeout(
      () =>
        setError(
          "Street View ne se charge pas. Tu peux fermer cette fenêtre ou réessayer.",
        ),
      20000,
    );
    return () => clearTimeout(timer);
  }, [active, ready, load]);
  useEffect(() => {
    if (!active || !ready) return;
    const id = ++generation.current;
    pending.current = id;
    started.current = Date.now();
    setError("");
    web.current?.postMessage(JSON.stringify(streetSnapshotRequest(target, id)));
    const timer = setTimeout(() => {
      if (pending.current === id) {
        pending.current = null;
        setError(
          "Le chargement prend trop de temps. Réessaie avec une connexion stable.",
        );
      }
    }, 15000);
    return () => {
      clearTimeout(timer);
      generation.current++;
      pending.current = null;
    };
  }, [active, ready, target]);
  function onMessage(event: WebViewMessageEvent) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ready") {
        setReady(true);
        return;
      }
      if (data.requestId !== undefined && data.requestId !== generation.current)
        return;
      if (data.type === "panorama") {
        pending.current = null;
        setError("");
        setNearby(
          Number.isFinite(data.distanceMeters) ? data.distanceMeters : null,
        );
        trace("streetview_ms", true, Math.max(0, Date.now() - started.current));
      } else if (data.type === "unavailable") {
        pending.current = null;
        setNearby(null);
        setError(
          data.reason === "coverage"
            ? "Aucune image Street View disponible à ce point."
            : "Street View est indisponible. Tu peux fermer cette fenêtre ou réessayer.",
        );
        trace(
          data.reason === "coverage" ? "streetview_coverage" : "streetview_ms",
          false,
          Math.max(0, Date.now() - started.current),
        );
      }
    } catch {}
  }
  return (
    <Modal
      visible
      animationType={reducedMotion ? "fade" : "slide"}
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <ModalFrame>
        <View
          style={[
            s.between,
            { paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
          ]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.eyebrow}>STREET VIEW</Text>
            <Text numberOfLines={1} style={[s.heading, { fontSize: 21 }]}>
              {target.title}
            </Text>
          </View>
          <IconButton
            name="close"
            label="Fermer Street View"
            onPress={onClose}
          />
        </View>
        <View style={{ flex: 1 }}>
          {active ? (
            <WebView<{}>
              ref={web}
              source={{ uri: `${API_URL}/streetview` }}
              javaScriptEnabled
              cacheEnabled={false}
              incognito
              scrollEnabled={false}
              onLoadStart={() => {
                setReady(false);
                setLoad((n) => n + 1);
              }}
              onMessage={onMessage}
              onError={() => {
                setError(
                  "Street View est indisponible. Réessaie ou ferme cette fenêtre.",
                );
              }}
              onContentProcessDidTerminate={() => {
                setReady(false);
                setError(
                  "La vue a été interrompue. Réessaie pour la recharger.",
                );
              }}
              originWhitelist={["https://*"]}
              onShouldStartLoadWithRequest={(req) => {
                if (
                  req.url === `${API_URL}/streetview` ||
                  req.url === "about:blank"
                )
                  return true;
                try {
                  const url = new URL(req.url);
                  if (
                    req.navigationType === "click" &&
                    url.protocol === "https:" &&
                    (url.hostname === "google.com" ||
                      url.hostname.endsWith(".google.com"))
                  )
                    void Linking.openURL(req.url).catch(() => {});
                } catch {}
                return false;
              }}
              style={{ flex: 1, backgroundColor: colors.cream }}
            />
          ) : (
            <View style={[s.content, { flex: 1, justifyContent: "center" }]}>
              <Text style={s.body}>
                La vue se rechargera au retour dans l’application.
              </Text>
            </View>
          )}
        </View>
        <View style={{ padding: 12, gap: 8 }}>
          {!!error && (
            <>
              <Text accessibilityRole="alert" style={s.caption}>
                {error}
              </Text>
              <Button
                compact
                label="Réessayer"
                secondary
                onPress={() => {
                  setError("");
                  setReady(false);
                  web.current?.reload();
                }}
              />
            </>
          )}
          <Text style={s.caption}>
            {target.kind === "point" && nearby !== null
              ? `Vue à environ ${nearby} m du repère. `
              : ""}
            Images d’archive Google · la signalisation peut avoir changé.
          </Text>
        </View>
      </ModalFrame>
    </Modal>
  );
}
