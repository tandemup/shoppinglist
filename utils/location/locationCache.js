import { storage } from "../storage/storage";
import { STORAGE_KEYS } from "../storage/storageKeys";

const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutos

export async function getCachedLocation() {
  try {
    const parsed = await storage.getJSON(STORAGE_KEYS.LOCATION_CACHE, null);

    if (!parsed) {
      console.log("📍 Cache location: MISS");
      return null;
    }

    if (!parsed?.coords || !parsed?.timestamp) {
      console.log("📍 Cache location: INVALID");
      return null;
    }

    const expired = Date.now() - parsed.timestamp > MAX_AGE_MS;

    if (expired) {
      console.log("📍 Cache location: EXPIRED");
      return null;
    }

    console.log("📍 Cache location: HIT");

    return {
      coords: parsed.coords,
      timestamp: parsed.timestamp,
    };
  } catch (e) {
    console.warn("Error leyendo caché de ubicación", e);
    return null;
  }
}

export async function setCachedLocation(coords) {
  try {
    const payload = {
      coords,
      timestamp: Date.now(),
    };

    await storage.setJSON(STORAGE_KEYS.LOCATION_CACHE, payload);

    console.log("📍 Cache location: SAVED", payload);
  } catch (e) {
    console.warn("Error guardando caché de ubicación", e);
  }
}

export async function clearCachedLocation() {
  try {
    await storage.remove(STORAGE_KEYS.LOCATION_CACHE);
    console.log("📍 Cache location: CLEARED");
  } catch (e) {
    console.warn("Error limpiando caché de ubicación", e);
  }
}
