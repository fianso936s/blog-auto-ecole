import {StudentHome} from "./screens/StudentHome";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import * as Haptics from "expo-haptics";
import { useFonts } from "expo-font";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_600SemiBold } from "@expo-google-fonts/dm-sans/600SemiBold";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { Manrope_700Bold } from "@expo-google-fonts/manrope/700Bold";
import { Manrope_800ExtraBold } from "@expo-google-fonts/manrope/800ExtraBold";
import { AppProvider, useApp } from "./state";
import { MapScreen } from "./screens/MapScreen";
import { Pedagogy } from "./screens/Pedagogy";
import { Videos } from "./screens/Videos";
import { Account } from "./screens/Account";
import { Welcome } from "./screens/Welcome";
import { Icon } from "./components/UI";
import { colors, fonts, radius, shadow, styles as s } from "./theme";
void SplashScreen.preventAutoHideAsync();
import product from "../../../packages/product/product.json";
const nativeIcons = {pedagogy:["book-outline","book"],map:["map-outline","map"],videos:["videocam-outline","videocam"],account:["person-outline","person"]} as const;
const tabs = product.navigation.map(t=>({...t,icon:nativeIcons[t.id as keyof typeof nativeIcons][0],activeIcon:nativeIcons[t.id as keyof typeof nativeIcons][1]}));
function Shell() {
  const app = useApp();
  const [fontsReady, fontError] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, Manrope_700Bold, Manrope_800ExtraBold });
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("pedagogy");
  const [home,setHome]=useState(false);
  useEffect(()=>{setHome(app.profile?.role === "student");},[app.profile?.id]);
  useEffect(()=>{const open=(url:string|null)=>{if(url?.startsWith("reperespot://meta-live")){setHome(false);setTab("videos");app.setMessage("Ouvrez la connexion Meta pour lancer le direct depuis vos lunettes.");}};void Linking.getInitialURL().then(open);const sub=Linking.addEventListener("url",event=>open(event.url));return()=>sub.remove();},[]);
  useEffect(() => {
    if (!app.loading && (fontsReady || fontError)) void SplashScreen.hideAsync();
  }, [app.loading, fontsReady, fontError]);
  if (app.loading || !(fontsReady || fontError))
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
            {app.profile.role === "student" && !home && <Pressable accessibilityRole="button" onPress={()=>setHome(true)} style={({pressed})=>({alignSelf:"flex-start",minHeight:44,marginHorizontal:16,marginTop:8,marginBottom:4,paddingHorizontal:16,flexDirection:"row",alignItems:"center",gap:6,borderRadius:radius.pill,backgroundColor:colors.paper,borderWidth:1,borderColor:colors.line,transform:[{scale:pressed?0.97:1}],...shadow.sm})}><Icon name="chevron-back" size={16} color={colors.ink}/><Text style={{color:colors.ink,fontFamily:fonts.bodySemi,fontSize:14}}>Accueil</Text></Pressable>}
            {home ? <StudentHome user={app.profile.id} name={app.profile.name} go={id=>{setTab(id);setHome(false);}}/> : tab === "pedagogy" ? (
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
              style={{
                marginHorizontal: 12,
                marginBottom: 8,
                paddingVertical: 12,
                paddingLeft: 18,
                paddingRight: 14,
                borderRadius: radius.md,
                backgroundColor: colors.ink,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                ...shadow.lg,
              }}
            >
              <Text numberOfLines={3} style={{ flex: 1, color: colors.paper, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 }}>
                {app.message}
              </Text>
              <Icon name="close" size={18} color={colors.paper} />
            </Pressable>
          )}
          <View
            accessibilityRole="tablist"
            style={{
              flexDirection: "row",
              gap: 4,
              marginHorizontal: 12,
              marginBottom: 6,
              padding: 6,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.paper,
              ...shadow.md,
            }}
          >
            {tabs.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="tab"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: !home && tab === t.id }}
                onPress={() => {if (home || tab !== t.id) void Haptics.selectionAsync();setHome(false);setTab(t.id);}}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 54,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  backgroundColor: !home && tab === t.id ? colors.wine : "transparent",
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}
              >
                <View
                  style={{
                    width: 30,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={!home && tab === t.id ? t.activeIcon : t.icon}
                    size={21}
                    color={!home && tab === t.id ? colors.paper : colors.muted}
                  />
                  {t.id === "map" && !!app.active && (
                    <View
                      accessibilityLabel="Enregistrement en cours"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
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
                    fontFamily: !home && tab === t.id ? fonts.bodyBold : fonts.bodyMedium,
                    color: !home && tab === t.id ? colors.paper : colors.muted,
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
