// utils/storage/scannerHistory.js
import { storageClient } from "./storageClient";

const HISTORY_KEY = "@expo-shop/history";

/**
 * Lee el historial completo
 */
export async function getScannedHistory() {
  return (await storageClient.get(HISTORY_KEY)) ?? [];
}

/**
 * Limpia todo el historial
 */
export async function clearScannedHistory() {
  return await storageClient.set(HISTORY_KEY, []);
}

/**
 * Agrega un nuevo código o incrementa su contador si ya existe
 */
export async function addScannedProduct(code) {
  return await storageClient.update(HISTORY_KEY, (current) => {
    const history = Array.isArray(current) ? [...current] : [];

    const idx = history.findIndex((e) => e.code === code);

    if (idx !== -1) {
      // Ya existe → incrementar contador
      return history.map((item, i) =>
        i === idx ? { ...item, count: (item.count ?? 1) + 1 } : item
      );
    }

    // No existe → agregar entrada nueva
    return [
      ...history,
      {
        code,
        count: 1,
        ts: Date.now(), // timestamp opcional, útil para métricas
      },
    ];
  });
}

/**
 * Elimina un código del historial
 */
export async function deleteScannedEntry(code) {
  return await storageClient.update(HISTORY_KEY, (current) => {
    if (!Array.isArray(current)) return [];
    return current.filter((item) => item.code !== code);
  });
}
