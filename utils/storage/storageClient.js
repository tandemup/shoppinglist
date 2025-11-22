// utils/storage/storageClient.js
import AsyncStorage from "@react-native-async-storage/async-storage";

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.warn("[storageClient] JSON parse error:", e);
    return null;
  }
}

export const storageClient = {
  async get(key) {
    try {
      const raw = await AsyncStorage.getItem(key);
      return safeParse(raw);
    } catch (e) {
      console.warn(`[storageClient.get] Error reading ${key}:`, e);
      return null;
    }
  },

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[storageClient.set] Error writing ${key}:`, e);
      return false;
    }
  },

  async update(key, updaterFn) {
    try {
      const raw = await AsyncStorage.getItem(key);
      let current = safeParse(raw);

      // ⚠️ ARREGLO CRÍTICO PARA EXPO GO (iOS/Android):
      // No permitir null/undefined porque rompe listas y produce updates vacíos.
      if (current === null || current === undefined) {
        // Por defecto, las listas y la mayoría de estructuras de este proyecto son arrays
        current = [];
      }

      const updated = updaterFn(current);

      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn(`[storageClient.update] Error updating ${key}:`, e);
      return null;
    }
  },

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn(`[storageClient.remove] Error removing ${key}:`, e);
      return false;
    }
  },
};
