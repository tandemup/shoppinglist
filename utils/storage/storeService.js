// utils/storage/storeService.js
import { storageClient } from "./storageClient";

const STORE_KEY = "@expo-shop/store";

/**
 * Carga la tienda seleccionada
 */
export async function loadSelectedStore() {
  return (await storageClient.get(STORE_KEY)) ?? null;
}

/**
 * Guarda la tienda seleccionada
 */
export async function saveSelectedStore(store) {
  return await storageClient.set(STORE_KEY, store);
}

/**
 * Limpia la tienda seleccionada
 */
export async function clearSelectedStore() {
  return await storageClient.remove(STORE_KEY);
}
