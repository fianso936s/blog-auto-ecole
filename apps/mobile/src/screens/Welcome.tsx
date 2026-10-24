import React, { useEffect } from "react";
import { View, Text, ScrollView, Image, Pressable, Linking } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useApp } from "../state";
import { colors, fonts, radius, shadow, styles as s } from "../theme";
import { Button, Icon } from "../components/UI";
import product from "../../../../packages/product/product.json";

/** The website landing's night map card, alive like on the site: drifting glow, flowing waves, floating pin. */
function MapCard() {
  const reduced = useReducedMotion();
  const glow = useSharedValue(0), wave = useSharedValue(0), pin = useSharedValue(0), trace = useSharedValue(0);
  useEffect(() => {
    if (reduced) { trace.value = 1; return; }
    glow.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);
    wave.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.linear }), -1, false);
    trace.value = withDelay(250, withTiming(1, { duration: 1100, easing: Easing.bezier(0.77, 0, 0.175, 1) }));
    pin.value = withDelay(1050, withSequence(withTiming(1, { duration: 620, easing: Easing.bezier(0.23, 1, 0.32, 1) }), withRepeat(withTiming(2, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true)));
  }, [reduced]);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: glow.value * 60 }, { translateY: glow.value * 30 }, { scale: 1 + glow.value * 0.15 }] }));
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -wave.value * 200 }] }));
  const traceStyle = useAnimatedStyle(() => ({ opacity: trace.value, transform: [{ skewX: "-18deg" }, { scaleX: 0.4 + trace.value * 0.6 }] }));
  const pinStyle = useAnimatedStyle(() => {
    const drop = Math.min(pin.value, 1), bob = Math.max(0, pin.value - 1);
    return { opacity: reduced ? 1 : drop, transform: [{ translateY: reduced ? 0 : (1 - drop) * -28 - bob * 3 }, { translateX: bob * 3 }, { rotate: "-45deg" }] };
  });
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: 250, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.night }}
    >
      <Animated.View style={[{ position: "absolute", left: -80, top: -90, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(106,34,54,0.55)" }, glowStyle]} />
      <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: 1200, height: 250 }, waveStyle]}>
        {[60, 110, 165, 210].map((y, i) => (
          <View key={y} style={{ position: "absolute", top: y, left: 0, flexDirection: "row" }}>
            {Array.from({ length: 12 }, (_, k) => (
              <View key={k} style={{ width: 100, height: 16, borderTopWidth: 1.4, borderColor: colors.blush, borderRadius: 50, opacity: [0.26, 0.16, 0.22, 0.12][i], transform: [{ scaleY: k % 2 ? -1 : 1 }] }} />
            ))}
          </View>
        ))}
      </Animated.View>
      <View style={{ position: "absolute", left: -60, top: 120, width: 560, height: 34, backgroundColor: "#4D1A2B", transform: [{ rotate: "-24deg" }] }} />
      <View style={{ position: "absolute", left: 120, top: -40, width: 34, height: 420, backgroundColor: "#4D1A2B", transform: [{ rotate: "32deg" }] }} />
      <View style={{ position: "absolute", right: -40, top: -30, width: 150, height: 150, borderRadius: 48, backgroundColor: "#5B6E58", opacity: 0.55 }} />
      <View style={{ position: "absolute", left: -50, bottom: -60, width: 150, height: 150, borderRadius: 48, backgroundColor: "#5B6E58", opacity: 0.4 }} />
      <Animated.View style={[{ position: "absolute", left: 70, top: 70, width: 210, height: 120, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: colors.blush, borderBottomLeftRadius: 40 }, traceStyle]} />
      <Animated.View style={[{ position: "absolute", right: 56, top: 40, width: 54, height: 54, borderRadius: 27, borderBottomLeftRadius: 6, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", ...shadow.lg }, pinStyle]}>
        <View style={{ transform: [{ rotate: "45deg" }] }}>
          <Icon name="location-outline" size={24} color={colors.wine} />
        </View>
      </Animated.View>
      <Image
        source={require("../../assets/logo.png")}
        resizeMode="contain"
        style={{ position: "absolute", left: 20, top: 18, width: 128, height: 56, tintColor: colors.paper }}
      />
      <View style={{ position: "absolute", left: 14, right: 14, bottom: 14, padding: 14, borderRadius: radius.md, backgroundColor: "rgba(255,248,242,0.12)", borderWidth: 1, borderColor: "rgba(255,248,242,0.18)" }}>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.blush }}>VOTRE PROCHAIN DÉCLIC</Text>
        <Text style={{ marginTop: 4, fontFamily: fonts.display, fontSize: 17, color: colors.paper, letterSpacing: -0.3 }}>Un détail observé. Un réflexe acquis.</Text>
      </View>
    </View>
  );
}

/** Mirrors the website landing: same promise, same three features, same actions and footer. */
export function Welcome({ onExplore }: { onExplore: () => void }) {
  const { login, authBusy, message } = useApp();
  return (
    <ScrollView contentContainerStyle={[s.content, { flexGrow: 1, paddingTop: 12, paddingHorizontal: 12 }]}>
      <MapCard />
      <View style={{ gap: 16, paddingHorizontal: 12, paddingTop: 12 }}>
        <Text style={s.eyebrow}>APPRENDRE À VOIR. APPRENDRE À CONDUIRE.</Text>
        <Text style={[s.title, { fontSize: 42, lineHeight: 44, letterSpacing: -1.8 }]} accessibilityRole="header">
          Chaque trajet,{`\n`}
          <Text style={{ color: colors.wine }}>un repère.</Text>
        </Text>
        <Text style={s.subtitle}>Enregistrez le réel. Repérez les situations.{`\n`}Progressez à votre rythme.</Text>
      </View>
      <View style={{ gap: 8, paddingHorizontal: 12 }}>
        {[
          ["book-outline", "Des fiches pour comprendre"],
          ["map-outline", "Vos parcours et repères sur la carte"],
          ["videocam-outline", "Revoir vos leçons en vidéo"],
        ].map(([icon, label]) => (
          <View key={label} style={[s.row, { padding: 8, paddingRight: 12, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }]}>
            <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" }}>
              <Icon name={icon as any} size={18} />
            </View>
            <Text style={[s.body, { fontFamily: fonts.bodyMedium, fontSize: 15 }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 10, paddingHorizontal: 12 }}>
        {!!message && <Text accessibilityRole="alert" style={s.error}>{message}</Text>}
        <Button label="Se connecter" onPress={() => void login("signin")} busy={authBusy} icon="arrow-forward" />
        <Button label="Créer mon compte" secondary onPress={() => void login("signup")} disabled={authBusy} />
        <Pressable accessibilityRole="button" onPress={onExplore} style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: colors.wine }}>Découvrir les fiches pédagogiques</Text>
          <Icon name="arrow-forward" size={16} />
        </Pressable>
      </View>
      <View style={[s.between, { paddingHorizontal: 12, marginTop: "auto" }]}>
        <Text style={s.caption}>Élèves et enseignants, chacun son espace.</Text>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(`${product.webOrigin}/privacy`)} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={s.caption}>Confidentialité</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
