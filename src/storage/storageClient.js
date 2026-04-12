import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";

function getWebStorage() {
  if (!isWeb) return null;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch (error) {
    console.warn("[storage] localStorage no disponible", error);
  }

  return null;
}

async function getString(key, fallback = null) {
  try {
    if (isWeb) {
      const webStorage = getWebStorage();
      const value = webStorage ? webStorage.getItem(key) : null;
      return value ?? fallback;
    }

    const value = await AsyncStorage.getItem(key);
    return value ?? fallback;
  } catch (error) {
    console.warn(`[storage] getString failed for key "${key}"`, error);
    return fallback;
  }
}

async function setString(key, value) {
  try {
    const safeValue = typeof value === "string" ? value : String(value);

    if (isWeb) {
      const webStorage = getWebStorage();
      if (!webStorage) return false;
      webStorage.setItem(key, safeValue);
      return true;
    }

    await AsyncStorage.setItem(key, safeValue);
    return true;
  } catch (error) {
    console.warn(`[storage] setString failed for key "${key}"`, error);
    return false;
  }
}

async function getJSON(key, fallback = null) {
  try {
    const raw = await getString(key, null);

    if (raw == null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] getJSON failed for key "${key}"`, error);
    return fallback;
  }
}

async function setJSON(key, value) {
  try {
    return await setString(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] setJSON failed for key "${key}"`, error);
    return false;
  }
}

async function remove(key) {
  try {
    if (isWeb) {
      const webStorage = getWebStorage();
      if (!webStorage) return false;
      webStorage.removeItem(key);
      return true;
    }

    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] remove failed for key "${key}"`, error);
    return false;
  }
}

async function mergeJSON(key, partialValue) {
  try {
    const current = await getJSON(key, {});

    const safeCurrent =
      current && typeof current === "object" && !Array.isArray(current)
        ? current
        : {};

    const safePartial =
      partialValue &&
      typeof partialValue === "object" &&
      !Array.isArray(partialValue)
        ? partialValue
        : {};

    const nextValue = {
      ...safeCurrent,
      ...safePartial,
    };

    await setJSON(key, nextValue);
    return nextValue;
  } catch (error) {
    console.warn(`[storage] mergeJSON failed for key "${key}"`, error);
    return null;
  }
}

async function getAllKeys() {
  try {
    if (isWeb) {
      const webStorage = getWebStorage();
      if (!webStorage) return [];
      return Object.keys(webStorage);
    }

    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.warn("[storage] getAllKeys failed", error);
    return [];
  }
}

async function clearAppStorage(prefix = "@shopping/") {
  try {
    const keys = await getAllKeys();
    const appKeys = keys.filter((key) => key.startsWith(prefix));

    await Promise.all(appKeys.map((key) => remove(key)));
    return true;
  } catch (error) {
    console.warn("[storage] clearAppStorage failed", error);
    return false;
  }
}

export const storageClient = {
  getString,
  setString,
  getJSON,
  setJSON,
  remove,
  mergeJSON,
  getAllKeys,
  clearAppStorage,
};
