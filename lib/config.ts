import Constants from "expo-constants";
import { Platform } from "react-native";

type ExtraConfig = {
  apiBaseUrl?: string;
  googleClientId?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
  googleAndroidClientId?: string;
};

const DEV_API_BASE_URL = "http://127.0.0.1:8001";

function extra(): ExtraConfig {
  return (Constants.expoConfig?.extra ?? {}) as ExtraConfig;
}

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function requireApiBaseUrl() {
  const configured = firstNonEmpty(process.env.EXPO_PUBLIC_API_BASE_URL, extra().apiBaseUrl);
  if (configured) return configured;
  if (typeof __DEV__ !== "undefined" && __DEV__) return DEV_API_BASE_URL;
  throw new Error("EXPO_PUBLIC_API_BASE_URL is required for a release build.");
}

/**
 * Django listens on 127.0.0.1:8001. That host is the emulator itself on Android,
 * so loopback is rewritten to the emulator alias 10.0.2.2. iOS simulator and web
 * keep the documented URL.
 */
function reachableDevBaseUrl(configured: string) {
  if (typeof __DEV__ === "undefined" || !__DEV__ || Platform.OS !== "android") return configured;
  try {
    const url = new URL(configured);
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") return configured;
    url.hostname = "10.0.2.2";
    return url.toString().replace(/\/$/, "");
  } catch {
    return configured;
  }
}

/** Contract base URL comes from EXPO_PUBLIC_API_BASE_URL. Dev may fall back to localhost. */
export const API_BASE_URL = reachableDevBaseUrl(requireApiBaseUrl());

/** Same host as the HTTP API, with the access JWT the REST client already stores. */
export function cartSocketUrl(accessToken: string) {
  const wsBase = API_BASE_URL.replace(/^http/i, "ws").replace(/\/$/, "");
  const url = new URL("/ws/cart/", `${wsBase}/`);
  url.searchParams.set("token", accessToken);
  return url.toString();
}

/** Same host and access JWT as the cart socket. */
export function savedSocketUrl(accessToken: string) {
  const wsBase = API_BASE_URL.replace(/^http/i, "ws").replace(/\/$/, "");
  const url = new URL("/ws/saved/", `${wsBase}/`);
  url.searchParams.set("token", accessToken);
  return url.toString();
}

const NGROK_HOST_SUFFIXES = [".ngrok-free.app", ".ngrok-free.dev", ".ngrok.io", ".ngrok.app", ".ngrok.dev"];

function isNgrokHost(hostname: string) {
  const host = hostname.toLowerCase();
  return NGROK_HOST_SUFFIXES.some((suffix) => host === suffix.slice(1) || host.endsWith(suffix));
}

/** Free ngrok serves an HTML interstitial unless API calls send this header. */
export function ngrokHeaders(): Record<string, string> {
  try {
    if (!isNgrokHost(new URL(API_BASE_URL).hostname)) return {};
  } catch {
    return {};
  }
  return { "ngrok-skip-browser-warning": "true" };
}

export const googleConfig = {
  clientId: firstNonEmpty(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID, extra().googleClientId),
  webClientId: firstNonEmpty(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, extra().googleWebClientId),
  iosClientId: firstNonEmpty(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, extra().googleIosClientId),
  androidClientId: firstNonEmpty(
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    extra().googleAndroidClientId,
  ),
};

export const googleSignInConfigured = googleConfig.clientId.length > 0;
