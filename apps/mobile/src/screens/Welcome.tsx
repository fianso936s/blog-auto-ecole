import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useApp } from "../state";
import { colors, styles as s } from "../theme";
import { Button, Icon } from "../components/UI";
export function Welcome() {
  const { login, authBusy, message } = useApp();
  return (
    <ScrollView
      contentContainerStyle={[
        s.content,
        { flexGrow: 1, justifyContent: "space-between", paddingTop: 28 },
      ]}
    >
      <View style={s.between}>
        <Text style={s.eyebrow}>LE REPÈRE</Text>
        <Text style={[s.eyebrow, { color: colors.muted }]}>PERMIS</Text>
      </View>
      <View style={{ gap: 30, paddingVertical: 30 }}>
        <View
          style={{
            height: 155,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              borderColor: colors.line,
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 98,
                height: 98,
                borderRadius: 49,
                backgroundColor: colors.soft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="navigate-outline" size={40} />
            </View>
          </View>
        </View>
        <View style={{ gap: 18 }}>
          <Text
            style={[
              s.title,
              { fontSize: 46, lineHeight: 49, letterSpacing: -2 },
            ]}
          >
            Chaque trajet,{`\n`}un repère.
          </Text>
          <Text style={s.subtitle}>
            Enregistrez le réel. Repérez les situations.{`\n`}Progressez à votre
            rythme.
          </Text>
        </View>
        <View style={{ gap: 14 }}>
          {[
            ["radio-button-on-outline", "Des parcours GPS réels"],
            ["map-outline", "Vos repères sur la carte"],
            ["play-circle-outline", "Revoir. Comprendre. Progresser."],
          ].map(([icon, label]) => (
            <View key={label} style={s.row}>
              <Icon name={icon as any} size={19} />
              <Text style={s.body}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 15 }}>
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
        <Text style={[s.caption, { textAlign: "center" }]}>
          Connexion par e-mail et mot de passe.{`\n`}Enseignants et élèves,
          chacun son espace.
        </Text>
      </View>
    </ScrollView>
  );
}
