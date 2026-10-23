import release from "../../packages/product/generated/release.json";
import product from "../../packages/product/product.json";
import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // EAS CLI and Expo prebuild normalize accented project names differently.
  // Keep the native target ASCII; preserve the public name on the iPhone.
  name: "Le Repere Permis",
  slug: "le-repere-spot",
  version: product.version,
  scheme: "reperespot",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  backgroundColor: "#F5F0E8",
  ios: {
    bundleIdentifier: "fr.lerepere.spot",
    appleTeamId: "LK3VLK532C",
    supportsTablet: false,
    associatedDomains: ["applinks:"+new URL(product.apiOrigin).hostname],
    entitlements: { "com.apple.developer.networking.HotspotConfiguration": true },
    infoPlist: {
      CFBundleDisplayName: "Le Repère Permis",
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "Votre position sert à tracer votre parcours réel et à placer vos repères sur la carte.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Pendant un enregistrement lancé par vous, Le Repère Permis utilise votre position même si l’écran est verrouillé.",
      // DAT transport is Bluetooth + Wi-Fi + ExternalAccessory; iOS may still stop
      // active video capture when the app becomes backgrounded.
      UIBackgroundModes: ["location", "bluetooth-central", "bluetooth-peripheral", "external-accessory"],
      UISupportedExternalAccessoryProtocols: ["com.meta.ar.wearable"],
      NSBluetoothAlwaysUsageDescription: "Connexion aux lunettes Meta pour filmer un parcours depuis l’iPhone.",
      NSLocalNetworkUsageDescription: "Détection et connexion aux lunettes Meta sur le réseau local.",
      NSBonjourServices: ["_bonjour._tcp", "_expo._tcp"],
      LSApplicationQueriesSchemes: ["fb-viewapp"],
      MWDAT: {
        AppLinkURLScheme: product.apiOrigin+"/meta/callback",
        // Build-time metadata for the official companion-app handshake.
        // No R2 access key or DB credential is ever compiled into iOS.
        MetaAppID: process.env.META_APP_ID || "0",
        ClientToken: process.env.META_CLIENT_TOKEN || "",
        TeamID: "LK3VLK532C",
      },
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPITypeReasons: ["C617.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
          NSPrivacyAccessedAPITypeReasons: ["E174.1"],
        },
      ],
    },
  },
  android: {
    package: "fr.lerepere.spot",
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
      "FOREGROUND_SERVICE_LOCATION",
    ],
  },
  plugins: [
    "@livekit/react-native-expo-plugin",
    ["@config-plugins/react-native-webrtc", { cameraPermission: "La caméra iPhone n’est pas utilisée pour les lives Meta.", microphonePermission: "Le microphone est désactivé par défaut pour les lives Meta." }],
    "@maplibre/maplibre-react-native",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Autorisez Le Repère Permis à suivre le parcours que vous enregistrez, y compris lorsque l’écran est verrouillé.",
        locationWhenInUsePermission:
          "Votre position permet d’enregistrer votre parcours réel.",
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Ajoutez une photographie à votre repère pédagogique.",
        cameraPermission: "Photographiez un repère pédagogique.",
        microphonePermission: false,
      },
    ],
    ["expo-secure-store", { configureAndroidBackup: true }],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F5F0E8",
        image: "./assets/splash.png",
        imageWidth: 180,
      },
    ],
    ["expo-build-properties", { ios: { deploymentTarget: "17.2" } }],
    "expo-sqlite",
    "expo-web-browser",
  ],
  extra: {
    ...config.extra,
    product: release,
    ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      ? {
          eas: {
            ...config.extra?.eas,
            projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
          },
        }
      : {}),
  },
});
