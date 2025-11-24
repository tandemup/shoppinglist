// utils/storage/storageClient.js
import AsyncStorage from "@react-native-async-storage/async-storage";

function safeParse(value) {
  try {
    if (value === null || value === undefined) return null;
    return JSON.parse(value);
  } catch (e) {
    console.warn("[storageClient] JSON parse error:", e);
    return null;
  }
}

export const storageClient = {
  async get(key) {
    try {
      const raw = await AsyncStorage.getItem(key);
      const parsed = safeParse(raw);
      return parsed === null ? null : parsed;
    } catch (e) {
      console.warn(`[storageClient.get] Error reading ${key}:`, e);
      return null;
    }
  },

  async set(key, value) {
    try {
      // Nunca guardar undefined → lo convertimos a null
      const safeValue = value === undefined ? null : value;
      await AsyncStorage.setItem(key, JSON.stringify(safeValue));
      return true;
    } catch (e) {
      console.warn(`[storageClient.set] Error saving ${key}:`, e);
      return false;
    }
  },

  async update(key, updater) {
    try {
      const raw = await AsyncStorage.getItem(key);
      const current = safeParse(raw);

      // Siempre enviamos un objeto o array válido al updater
      const safeCurrent =
        current !== null && current !== undefined ? current : {};

      const updated = updater(safeCurrent);

      // Asegurar que updated es guardable
      const safeUpdated = updated === undefined ? safeCurrent : updated;

      await AsyncStorage.setItem(key, JSON.stringify(safeUpdated));
      return safeUpdated;
    } catch (e) {
      console.warn(`[storageClient.update] Error updating ${key}:`, e);
      return null;
    }
  },
};
