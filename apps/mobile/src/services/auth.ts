import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import type { Profile } from "@repere/core";
import { API_URL, AUTH_CALLBACK } from "../config";
WebBrowser.maybeCompleteAuthSession();
const tokenKey = "repere.session.v1",
  profileKey = "repere.profile.v1",
  verifierKey = "repere.pkce.v1";
let token: string | null = null;
export async function loadSession() {
  token = await SecureStore.getItemAsync(tokenKey);
  const json = await SecureStore.getItemAsync(profileKey);
  if (!token || !json) return null;
  try { return JSON.parse(json) as Profile; } catch { await clearSession(); return null; }
}
export function getToken() {
  return token;
}
export async function rememberProfile(p: Profile) {
  await SecureStore.setItemAsync(profileKey, JSON.stringify(p), {keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
}
export async function clearSession() {
  token = null;
  await Promise.all([
    SecureStore.deleteItemAsync(tokenKey),
    SecureStore.deleteItemAsync(profileKey),
    SecureStore.deleteItemAsync(verifierKey),
  ]);
}
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!API_URL)
    throw new Error(
      "L’adresse du serveur doit être configurée avant la compilation.",
    );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let response: Response;
  try {
    response = await fetch(API_URL + path, {
      ...init,
      signal: init.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : { ...{} }),
        ...init.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
  const body = await response
    .json()
    .catch(() => ({ error: "Le serveur ne répond pas correctement." }));
  if (!response.ok)
    throw Object.assign(new Error(body.error || "La demande a échoué."), {
      status: response.status,
    });
  return body as T;
}
const b64url = (bytes: Uint8Array) => {
  const abc =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!,
      b = bytes[i + 1],
      c = bytes[i + 2];
    out +=
      abc[a >> 2] +
      abc[((a & 3) << 4) | ((b ?? 0) >> 4)] +
      (b === undefined ? "" : abc[((b & 15) << 2) | ((c ?? 0) >> 6)]) +
      (c === undefined ? "" : abc[c & 63]);
  }
  return out;
};
export async function finishLogin(url: string) {
  const callback = new URL(url);
  if (callback.protocol !== "reperespot:" || callback.hostname !== "auth")
    return null;
  const code = callback.searchParams.get("code");
  const verifier = await SecureStore.getItemAsync(verifierKey);
  if (!code || !verifier)
    throw new Error("Cette connexion a expiré. Recommencez.");
  const result = await request<{ token: string; profile: Profile }>(
    "/v1/auth/exchange",
    { method: "POST", body: JSON.stringify({ code, verifier }) },
  );
  token = result.token;
  await SecureStore.setItemAsync(tokenKey, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await rememberProfile(result.profile);
  await SecureStore.deleteItemAsync(verifierKey);
  return result.profile;
}
export async function signIn(mode: "signin" | "signup" = "signin") {
  const verifier = b64url(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(verifierKey, verifier, {keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});
  const base64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  const challenge = base64
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
  const { url } = await request<{ url: string }>("/v1/auth/start", {
    method: "POST",
    body: JSON.stringify({ challenge }),
  });
  const destination = new URL(url);
  if (destination.origin !== new URL(API_URL).origin || destination.pathname !== "/auth") throw new Error("Adresse de connexion invalide.");
  destination.searchParams.set("mode", mode);
  const result = await WebBrowser.openAuthSessionAsync(destination.href, AUTH_CALLBACK, {
    preferEphemeralSession: false,
  });
  if (result.type !== "success") return null;
  return finishLogin(result.url);
}
