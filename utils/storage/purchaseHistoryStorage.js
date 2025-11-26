import { storageClient } from "./storageClient";

const HISTORY_KEY = "@expo-shop/history";

export async function loadHistory() {
  const h = await storageClient.get(HISTORY_KEY);
  return Array.isArray(h) ? h : [];
}

export async function saveHistory(itemsArray) {
  await storageClient.set(HISTORY_KEY, itemsArray);
  return itemsArray;
}
