import Constants from "expo-constants";

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

/** Contract base URL comes from EXPO_PUBLIC_API_BASE_URL. Dev may fall back to localhost. */
export const API_BASE_URL = requireApiBaseUrl();

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
