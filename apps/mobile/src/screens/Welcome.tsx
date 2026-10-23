import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useApp } from "../state";
import { colors, fonts, radius, shadow, styles as s } from "../theme";
import { Button, Icon } from "../components/UI";
/** Same composition as the website landing on a phone: night map card, promise, actions. */
function MapCard() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: 250, borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.night }}
    >
      <View style={{ position: "absolute", left: -60, top: 120, width: 560, height: 34, backgroundColor: "#4D1A2B", transform: [{ rotate: "-24deg" }] }} />
      <View style={{ position: "absolute", left: 120, top: -40, width: 34, height: 420, backgroundColor: "#4D1A2B", transform: [{ rotate: "32deg" }] }} />
      <View style={{ position: "absolute", right: -40, top: -30, width: 150, height: 150, borderRadius: 48, backgroundColor: "#5B6E58", opacity: 0.55 }} />
      <View style={{ position: "absolute", left: -50, bottom: -60, width: 150, height: 150, borderRadius: 48, backgroundColor: "#5B6E58", opacity: 0.4 }} />
      <View style={{ position: "absolute", left: 70, top: 70, width: 210, height: 120, borderLeftWidth: 3, borderBottomWidth: 3, borderColor: colors.blush, borderBottomLeftRadius: 40, transform: [{ skewX: "-18deg" }] }} />
      <View style={{ position: "absolute", right: 56, top: 40, width: 54, height: 54, borderRadius: 27, borderBottomLeftRadius: 6, transform: [{ rotate: "-45deg" }], backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", ...shadow.lg }}>
        <View style={{ transform: [{ rotate: "45deg" }] }}>
          <Icon name="location-outline" size={24} color={colors.wine} />
        </View>
      </View>
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
export function Welcome() {
  const { login, authBusy, message } = useApp();
  return (
    <ScrollView
      contentContainerStyle={[
        s.content,
        { flexGrow: 1, justifyContent: "space-between", paddingTop: 12, paddingHorizontal: 12 },
      ]}
    >
      <MapCard />
      <View style={{ gap: 24, paddingHorizontal: 12, paddingVertical: 12 }}>
        <View style={{ gap: 16 }}>
          <View style={s.between}>
            <Text style={s.eyebrow}>LE REPÈRE</Text>
            <Text style={[s.eyebrow, { color: colors.muted }]}>PERMIS</Text>
          </View>
          <Text style={[s.title, { fontSize: 42, lineHeight: 44, letterSpacing: -1.8 }]}>
            Chaque trajet,{`\n`}
            <Text style={{ color: colors.wine }}>un repère.</Text>
          </Text>
          <Text style={s.subtitle}>
            Enregistrez le réel. Repérez les situations.{`\n`}Progressez à votre
            rythme.
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {[
            ["radio-button-on-outline", "Des parcours GPS réels"],
            ["map-outline", "Vos repères sur la carte"],
            ["play-circle-outline", "Revoir. Comprendre. Progresser."],
          ].map(([icon, label]) => (
            <View
              key={label}
              style={[s.row, { padding: 8, paddingRight: 12, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }]}
            >
              <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" }}>
                <Icon name={icon as any} size={18} />
              </View>
              <Text style={[s.body, { fontFamily: fonts.bodyMedium, fontSize: 15 }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 10, paddingHorizontal: 12 }}>
        {!!message && (
          <Text accessibilityRole="alert" style={s.error}>
            {message}
          </Text>
        )}
        <Button
          label="Se connecter"
          onPress={() => void login("signin")}
          busy={authBusy}
          icon="arrow-forward"
        />
        <Button label="Créer mon compte" secondary onPress={() => void login("signup")} disabled={authBusy} />
        <Text style={[s.caption, { textAlign: "center", marginTop: 6 }]}>
          Connexion par e-mail et mot de passe.{`\n`}Enseignants et élèves,
          chacun son espace.
        </Text>
      </View>
    </ScrollView>
  );
}
