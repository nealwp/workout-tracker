import { Platform } from "react-native";

const KEYS = {
  ACCESS_TOKEN: "auth.accessToken",
  REFRESH_TOKEN: "auth.refreshToken",
} as const;

function webGet(key: string): Promise<string | null> {
  return Promise.resolve(localStorage.getItem(key));
}

function webSet(key: string, value: string): Promise<void> {
  localStorage.setItem(key, value);
  return Promise.resolve();
}

function webDelete(key: string): Promise<void> {
  localStorage.removeItem(key);
  return Promise.resolve();
}

async function nativeGet(key: string): Promise<string | null> {
  const SecureStore = require("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function nativeSet(key: string, value: string): Promise<void> {
  const SecureStore = require("expo-secure-store");
  return SecureStore.setItemAsync(key, value);
}

async function nativeDelete(key: string): Promise<void> {
  const SecureStore = require("expo-secure-store");
  return SecureStore.deleteItemAsync(key);
}

const get = Platform.OS === "web" ? webGet : nativeGet;
const set = Platform.OS === "web" ? webSet : nativeSet;
const del = Platform.OS === "web" ? webDelete : nativeDelete;

export const tokenStore = {
  getAccessToken: () => get(KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => set(KEYS.ACCESS_TOKEN, token),
  getRefreshToken: () => get(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => set(KEYS.REFRESH_TOKEN, token),
  clearAll: async () => {
    await del(KEYS.ACCESS_TOKEN);
    await del(KEYS.REFRESH_TOKEN);
  },
};
