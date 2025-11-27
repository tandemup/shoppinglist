// utils/storage/scannerHistory.js
import { storageClient } from "./storageClient";

const HISTORY_KEY = "@expo-shop/history";

/**
 * Leer historial
 */
export async function getScannedHistory() {
  const data = await storageClient.get(HISTORY_KEY);
  return Array.isArray(data) ? data : [];
}

/**
 * Limpiar historial
 */
export async function clearScannedHistory() {
  return await storageClient.set(HISTORY_KEY, []);
}

/**
 * Añadir o incrementar contador
 */
export async function addScannedProduct(code) {
  return await storageClient.update(HISTORY_KEY, (current) => {
    const history = Array.isArray(current) ? [...current] : [];

    const index = history.findIndex((i) => i.code === code);

    if (index !== -1) {
      // ya existe → incrementar
      const old = history[index];
      return history.map((e, i) =>
        i === index
          ? { ...old, count: (old.count ?? 1) + 1, ts: Date.now() }
          : e
      );
    }

    // entrada nueva
    return [
      ...history,
      {
        code,
        count: 1,
        ts: Date.now(),
        isBook: false, // ← valor por defecto
      },
    ];
  });
}

/**
 * Eliminar entrada
 */
export async function deleteScannedEntry(code) {
  return await storageClient.update(HISTORY_KEY, (current) => {
    if (!Array.isArray(current)) return [];
    return current.filter((item) => item.code !== code);
  });
}

/**
 * ⭐ NUEVA FUNCIÓN (wrapper oficial) para borrar
 */
export async function deleteScannedItem(code) {
  return await deleteScannedEntry(code);
}

/**
 * Actualizar metadatos del producto escaneado
 */
export async function updateScannedEntry(code, patch) {
  return await storageClient.update(HISTORY_KEY, (current) => {
    const history = Array.isArray(current) ? [...current] : [];

    const index = history.findIndex((i) => i.code === code);
    if (index === -1) return history;

    const old = history[index];

    const updated = {
      ...old,
      ...patch, // mezcla fields (name, brand, url, isBook…)
      ts: Date.now(),
    };

    history[index] = updated;
    return history;
  });
}

/**
 * Guardar producto escaneado (datos completos)
 */
export async function addScannedProductFull({
  code,
  name,
  brand,
  image,
  url,
  isBook, // ← NUEVO
}) {
  // 1. Registrar o incrementar contador
  await addScannedProduct(code);

  // 2. Actualizar metadatos y tipo libro
  await updateScannedEntry(code, {
    name,
    brand,
    image,
    url,
    isBook, // ← se guarda ahora sí
  });
}
