// utils/storage/scannerHistory.js — VERSIÓN FINAL

import { storageClient } from "./storageClient";

// 👈 NUEVA KEY EXCLUSIVA PARA ESCANEOS
const SCANNED_KEY = "@expo-shop/scanned-history";

export async function getScannedHistory() {
  const data = await storageClient.get(SCANNED_KEY);
  return Array.isArray(data) ? data : [];
}

export async function clearScannedHistory() {
  return await storageClient.set(SCANNED_KEY, []);
}

export async function addScannedProduct(code) {
  return await storageClient.update(SCANNED_KEY, (current) => {
    const history = Array.isArray(current) ? [...current] : [];
    const index = history.findIndex((i) => i.code === code);

    if (index !== -1) {
      const old = history[index];
      return history.map((e, i) =>
        i === index
          ? { ...old, count: (old.count ?? 1) + 1, ts: Date.now() }
          : e
      );
    }

    return [
      {
        id: Date.now().toString(),
        code,
        count: 1,
        scannedAt: new Date().toISOString(),
        source: "scanner",
        ts: Date.now(),
      },
      ...history,
    ];
  });
}

export async function updateScannedEntry(code, patch) {
  return await storageClient.update(SCANNED_KEY, (current) => {
    const history = Array.isArray(current) ? [...current] : [];
    const index = history.findIndex((i) => i.code === code);
    if (index === -1) return history;

    const old = history[index];
    const updated = {
      ...old,
      ...patch,
      source: "scanner",
      scannedAt: old.scannedAt ?? new Date().toISOString(),
      ts: Date.now(),
    };

    history[index] = updated;
    return history;
  });
}

export async function addScannedProductFull({
  code,
  name,
  brand,
  image,
  url,
  isBook,
}) {
  await addScannedProduct(code);

  await updateScannedEntry(code, {
    name,
    brand,
    image,
    url,
    isBook,
  });
}

export async function deleteScannedEntry(code) {
  return await storageClient.update(SCANNED_KEY, (current) => {
    if (!Array.isArray(current)) return [];
    return current.filter((item) => item.code !== code);
  });
}

export async function deleteScannedItem(code) {
  return await deleteScannedEntry(code);
}
