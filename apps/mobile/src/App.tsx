import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AppProvider, useApp } from "./state";
import { MapScreen } from "./screens/MapScreen";
import { Pedagogy } from "./screens/Pedagogy";
import { Videos } from "./screens/Videos";
import { Account } from "./screens/Account";
import { Welcome } from "./screens/Welcome";
import { Icon } from "./components/UI";
import { colors, styles as s } from "./theme";
void SplashScreen.preventAutoHideAsync();
import product from "../../../packages/product/product.json";
const nativeIcons = {pedagogy:["book-outline","book"],map:["map-outline","map"],videos:["videocam-outline","videocam"],account:["person-outline","person"]} as const;
const tabs = product.navigation.map(t=>({...t,icon:nativeIcons[t.id as keyof typeof nativeIcons][0],activeIcon:nativeIcons[t.id as keyof typeof nativeIcons][1]}));
function Shell() {
  const app = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("pedagogy");
  useEffect(()=>{const open=(url:string|null)=>{if(url?.startsWith("reperespot://meta-live")){setTab("videos");app.setMessage("Ouvrez la connexion Meta pour lancer le direct depuis vos lunettes.");}};void Linking.getInitialURL().then(open);const sub=Linking.addEventListener("url",event=>open(event.url));return()=>sub.remove();},[]);
  useEffect(() => {
    if (!app.loading) void SplashScreen.hideAsync();
  }, [app.loading]);
  if (app.loading)
    return (
      <View
        style={[
          s.screen,
          { alignItems: "center", justifyContent: "center", gap: 18 },
        ]}
      >
        <Text style={s.eyebrow}>LE REPÈRE PERMIS</Text>
        <ActivityIndicator color={colors.wine} />
      </View>
    );
  return (
    <SafeAreaView
      style={s.screen}
      edges={tab === "map" && app.profile ? ["bottom"] : ["top", "bottom"]}
    >
      <StatusBar style="dark" />
      {!app.profile ? (
        <Welcome />
      ) : (
        <>
          <View style={{ flex: 1 }}>
            {tab === "pedagogy" ? (
              <Pedagogy />
            ) : tab === "map" ? (
              <MapScreen />
            ) : tab === "videos" ? (
              <Videos />
            ) : (
              <Account />
            )}
          </View>
          {!!app.message && (
            <Pressable
              onPress={() => app.setMessage("")}
              accessibilityRole="button"
              accessibilityLabel={`Fermer le message : ${app.message}`}
              style={[
                s.card,
                {
                  marginHorizontal: 14,
                  marginBottom: 6,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                },
              ]}
            >
              <Text numberOfLines={3} style={[s.caption, { flex: 1 }]}>
                {app.message}
              </Text>
              <Icon name="close" size={18} />
            </Pressable>
          )}
          <View
            accessibilityRole="tablist"
            style={{
              flexDirection: "row",
              paddingTop: 7,
              paddingBottom: 5,
              borderTopWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.paper,
            }}
          >
            {tabs.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: tab === t.id }}
                onPress={() => setTab(t.id)}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 58,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 54,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: tab === t.id ? colors.soft : "transparent",
                  }}
                >
                  <Icon
                    name={tab === t.id ? t.activeIcon : t.icon}
                    size={21}
                    color={tab === t.id ? colors.wine : colors.muted}
                  />
                  {t.id === "map" && !!app.active && (
                    <View
                      accessibilityLabel="Enregistrement en cours"
                      style={{
                        position: "absolute",
                        right: 4,
                        top: 1,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.red,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: tab === t.id ? "700" : "500",
                    color: tab === t.id ? colors.wine : colors.muted,
                  }}
                >
                  {t.short}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <View
        style={[s.screen, { padding: 30, justifyContent: "center", gap: 18 }]}
      >
        <Text style={s.heading}>Reprenons calmement.</Text>
        <Text style={s.subtitle}>
          Une erreur a interrompu l’écran. Vos enregistrements déjà conservés
          sur l’iPhone restent disponibles au redémarrage.
        </Text>
        <Pressable onPress={() => this.setState({ error: false })}>
          <Text style={{ color: colors.wine, fontWeight: "600" }}>
            Réessayer
          </Text>
        </Pressable>
      </View>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppProvider>
            <Shell />
          </AppProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
