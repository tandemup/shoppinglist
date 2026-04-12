import { storage } from "../src/storage/storage";
import { STORAGE_KEYS } from "../src/storage/storageKeys";
/* -------------------------------------------------
   Helpers internos
-------------------------------------------------- */
const loadAll = async () => {
  try {
    return await storage.getJSON(STORAGE_KEYS.SCANNED_ITEMS, []);
  } catch (err) {
    console.error("Error loading scanned items:", err);
    return [];
  }
};

const saveAll = async (items) => {
  try {
    await storage.setJSON(STORAGE_KEYS.SCANNED_ITEMS, items);
  } catch (err) {
    console.error("Error saving scanned items:", err);
  }
};

/* -------------------------------------------------
   API pública
-------------------------------------------------- */

/**
 * Devuelve todo el historial de escaneos
 */
export const getScannedHistory = async () => {
  return await loadAll();
};

/**
 * Añade o actualiza un escaneo
 */
export const addScannedItem = async (item) => {
  if (!item?.barcode) return null;

  const all = await loadAll();
  const index = all.findIndex((i) => i.barcode === item.barcode);
  const now = new Date().toISOString();

  if (index !== -1) {
    const updatedItem = {
      ...all[index],
      scanCount: (all[index].scanCount || 1) + 1,
      updatedAt: now,
    };

    const updated = [
      updatedItem,
      ...all.filter((i) => i.barcode !== item.barcode),
    ];

    await saveAll(updated);
    return updatedItem;
  }

  const newItem = {
    ...item,
    scanCount: 1,
    scannedAt: now,
    updatedAt: now,
    source: "scanner",
  };

  await saveAll([newItem, ...all]);
  return newItem;
};

/**
 * Actualiza campos editables
 */
export const updateScannedEntry = async (barcode, updates) => {
  if (!barcode) return;

  const all = await loadAll();

  const updated = all.map((item) =>
    item.barcode === barcode
      ? {
          ...item,
          ...updates,
          barcode,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );

  await saveAll(updated);
};

/**
 * Elimina un escaneo
 */
export const removeScannedItem = async (barcode) => {
  if (!barcode) return;

  const all = await loadAll();
  const filtered = all.filter((item) => item.barcode !== barcode);

  await saveAll(filtered);
};

/**
 * Borra todo el historial
 */
export const clearScannedHistory = async () => {
  try {
    await storage.remove(STORAGE_KEYS.SCANNED_ITEMS);
  } catch (err) {
    console.error("Error clearing scanned history:", err);
  }
};
