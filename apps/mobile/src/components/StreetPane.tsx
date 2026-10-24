import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Linking, Pressable, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { geometry, replayAnchor, type Fix } from "@repere/core";
import { API_URL } from "../config";
import { colors, fonts, radius, shadow, styles as s } from "../theme";
import { Button } from "./UI";
import { exploreHtml } from "./StreetViewButton";
import product from "../../../../packages/product/product.json";

/**
 * Same as the website's StreetPane: the Street View page follows the replay position
 * (one panorama per position, route geometry sent once), plus "Explorer librement".
 */
export function StreetPane({ fixes, index, active, onPause }: { fixes: Fix[]; index: number; active: boolean; onPause?: () => void }) {
  const web = useRef<WebView<{}>>(null),
    generation = useRef(0),
    sentPaths = useRef(false),
    pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [retry, setRetry] = useState(0),
    [explore, setExplore] = useState(false),
    [foreground, setForeground] = useState(AppState.currentState === "active");
  const paths = useMemo(() => geometry(fixes).coordinates.map((path) => path.map(([lng, lat]) => ({ lat: lat!, lng: lng! }))), [fixes]);
  const anchor = useMemo(() => replayAnchor(fixes, index), [fixes, index]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state === "active") setRetry((n) => n + 1);
    });
    return () => sub.remove();
  }, []);
  // A page can announce itself before we listen: repeat only the light handshake.
  useEffect(() => {
    if (!active || ready || !foreground) return;
    setError("");
    const connect = () => web.current?.postMessage(JSON.stringify({ type: "connect" }));
    connect();
    const handshake = setInterval(connect, 750);
    const timeout = setTimeout(() => {
      clearInterval(handshake);
      setError("Street View prend trop de temps à démarrer. Réessayez.");
    }, 30000);
    return () => {
      clearInterval(handshake);
      clearTimeout(timeout);
    };
  }, [active, ready, attempt, foreground]);
  useEffect(() => {
    clearTimeout(pending.current);
    if (!active || !ready || !anchor || explore || !foreground) return;
    setError("");
    const payload = { type: "fix", ...anchor, index, ...(sentPaths.current ? {} : { paths }), requestId: ++generation.current };
    sentPaths.current = true;
    web.current?.postMessage(JSON.stringify(payload));
    pending.current = setTimeout(() => setError("Cette vue ne répond pas. Réessayez ou continuez sur la carte."), 20000);
    return () => clearTimeout(pending.current);
  }, [active, ready, anchor, retry, explore, foreground]);
  function onMessage(event: WebViewMessageEvent) {
    let data: any;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (data.type === "ready") {
      setReady(true);
      return;
    }
    if (data.requestId !== undefined && data.requestId !== generation.current) return;
    if (data.type === "panorama" || data.type === "unavailable") {
      clearTimeout(pending.current);
      setError(data.type === "panorama" ? "" : data.message || "Aucune vue disponible ici. Continuez sur la carte.");
    }
  }
  function retryView() {
    setError("");
    if (ready) setRetry((n) => n + 1);
    else {
      sentPaths.current = false;
      setAttempt((n) => n + 1);
    }
  }
  if (!foreground)
    return (
      <View style={[s.content, { flex: 1, justifyContent: "center", backgroundColor: colors.cream }]}>
        <Text style={s.body}>La vue se rechargera au retour dans l’application.</Text>
      </View>
    );
  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <WebView<{}>
        key={attempt}
        ref={web}
        source={{ uri: `${API_URL}/streetview` }}
        javaScriptEnabled
        cacheEnabled={false}
        incognito
        scrollEnabled={false}
        onLoadStart={() => {
          setReady(false);
          sentPaths.current = false;
        }}
        onMessage={onMessage}
        onError={() => setError("Street View est indisponible. Réessayez ou continuez sur la carte.")}
        onContentProcessDidTerminate={() => {
          setReady(false);
          setError("La vue a été interrompue. Réessayez pour la recharger.");
        }}
        originWhitelist={["https://*"]}
        onShouldStartLoadWithRequest={(req) => {
          if (req.url === `${API_URL}/streetview` || req.url === "about:blank") return true;
          try {
            const url = new URL(req.url);
            if (req.navigationType === "click" && url.protocol === "https:" && (url.hostname === "google.com" || url.hostname.endsWith(".google.com")))
              void Linking.openURL(req.url).catch(() => {});
          } catch {}
          return false;
        }}
        style={{ flex: 1, backgroundColor: colors.ink }}
      />
      {explore && anchor && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <WebView<{}>
            key={`${anchor.lat},${anchor.lng}`}
            source={{ html: exploreHtml(anchor), baseUrl: product.webOrigin }}
            javaScriptEnabled
            scrollEnabled={false}
            originWhitelist={["https://*", "about:*"]}
            onShouldStartLoadWithRequest={(req) => req.isTopFrame === false ? req.url.startsWith("https://") || req.url === "about:blank" : req.url === "about:blank" || req.url.startsWith(product.webOrigin)}
            style={{ flex: 1, backgroundColor: colors.ink }}
          />
        </View>
      )}
      {!!anchor && (
        <View pointerEvents="box-none" style={{ position: "absolute", top: 12, left: 0, right: 0, alignItems: "center" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: explore }}
            onPress={() => {
              onPause?.();
              setExplore((v) => !v);
            }}
            style={({ pressed }) => [
              { minHeight: 44, paddingHorizontal: 18, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: explore ? colors.paper : colors.wine, transform: [{ scale: pressed ? 0.96 : 1 }] },
              shadow.md,
            ]}
          >
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: explore ? colors.wine : colors.paper }}>
              {explore ? "← Revenir au parcours" : "Explorer librement"}
            </Text>
          </Pressable>
        </View>
      )}
      {!!error && !explore && (
        <View style={[{ position: "absolute", left: 12, right: 12, bottom: 12, padding: 14, gap: 10, borderRadius: radius.md, backgroundColor: colors.paper }, shadow.md]}>
          <Text accessibilityRole="alert" style={s.body}>{error}</Text>
          <Button compact secondary label="Réessayer" onPress={retryView} />
        </View>
      )}
    </View>
  );
}
