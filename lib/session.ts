import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS = "reader.access";
const REFRESH = "reader.refresh";
const PROFILE = "reader.profile";

export type Tokens = { access: string; refresh: string };

export async function readTokens(): Promise<Tokens | null> {
  const access = await read(ACCESS);
  const refresh = await read(REFRESH);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export async function writeTokens(tokens: Tokens) {
  await write(ACCESS, tokens.access);
  await write(REFRESH, tokens.refresh);
}

export async function deleteTokens() {
  await remove(ACCESS);
  await remove(REFRESH);
}

export async function readProfileJson() {
  return read(PROFILE);
}

export async function writeProfileJson(value: string) {
  await write(PROFILE, value);
}

export async function deleteProfileJson() {
  await remove(PROFILE);
}

async function read(key: string) {
  if (Platform.OS === "web") return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function write(key: string, value: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function remove(key: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
