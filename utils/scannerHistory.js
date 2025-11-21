// utils/scannerHistory.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

const KEY = "scanned_history";

export const getScannedProducts = async () => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

export async function addScannedProduct(product) {
  const list = await getScannedProducts();

  const id = uuidv4(); // ← GENERAR UUID REAL

  list.unshift({
    id,
    ...product,
    date: Date.now(),
  });

  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export const deleteScannedProduct = async (id) => {
  const current = await getScannedProducts();
  const updated = current.filter((p) => p.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};
