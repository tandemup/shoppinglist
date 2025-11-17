// /utils/listHelpers.js
import { loadSelectedStore } from "./storeService";
import { getCurrentLocation } from "./locationHelpers";

// 📝 Construir una lista con metadatos completos
export async function buildFinalList(rawList) {
  // 1. Cargar tienda guardada
  const store = await loadSelectedStore();

  // 2. Guardar fecha actual
  const timestamp = new Date().toISOString();

  // 3. Obtener ubicación del usuario
  const gps = await getCurrentLocation();

  return {
    ...rawList,
    savedAt: timestamp,
    store: store || null,
    gpsLocation: gps || null,
  };
}
