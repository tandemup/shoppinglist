import { getItem, setItem } from "../utils/storage";

const SCANNED_KEY = "@expo-shop/scanned-history";

const loadAll = async () => {
  return (await getItem(SCANNED_KEY)) || [];
};

const saveAll = async (items) => {
  await setItem(SCANNED_KEY, items);
};

export const getScannedHistory = async () => {
  return await loadAll();
};

export const addScannedProductFull = async (item) => {
  const all = await loadAll();
  const barcode = item.barcode ?? item.code ?? null;

  if (!barcode) return null;

  const existing = all.find((i) => i.barcode === barcode);
  let newItem;

  if (existing) {
    newItem = {
      ...existing,
      name: item.name ?? existing.name,
      brand: item.brand ?? existing.brand,
      imageUrl: item.imageUrl ?? existing.imageUrl ?? null,
      url: item.url ?? existing.url ?? null,
      isBook: item.isBook ?? existing.isBook ?? false,
      scannedAt: new Date().toISOString(),
      scanCount: (existing.scanCount ?? 1) + 1,
    };

    const updated = [newItem, ...all.filter((i) => i.barcode !== barcode)];

    await saveAll(updated);
    return newItem;
  }

  newItem = {
    id: Date.now().toString(),
    barcode,
    name: item.name ?? "Producto",
    brand: item.brand ?? "",
    imageUrl: item.imageUrl ?? null,
    url: item.url ?? null,
    isBook: item.isBook ?? false,
    scannedAt: new Date().toISOString(),
    source: "scanner",
    scanCount: 1,
    notes: "",
  };

  await saveAll([newItem, ...all]);
  return newItem;
};

export const updateScannedEntry = async (barcode, updates) => {
  const all = await loadAll();

  const updated = all.map((item) =>
    item.barcode === barcode ? { ...item, ...updates, barcode } : item
  );

  await saveAll(updated);
};

export const removeScannedItem = async (barcode) => {
  const all = await loadAll();
  await saveAll(all.filter((item) => item.barcode !== barcode));
};

export const clearScannedHistory = async () => {
  await saveAll([]);
};
