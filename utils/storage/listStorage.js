// utils/storage/listStorage.js
import { storageClient } from "./storageClient";

const LISTS_KEY = "@expo-shop/lists";

/**
 * Carga todas las listas almacenadas
 */
export async function loadLists() {
  const lists = await storageClient.get(LISTS_KEY);
  return Array.isArray(lists) ? lists : [];
}

/**
 * Guarda todas las listas (sobrescritura completa)
 */
export async function saveLists(lists) {
  if (!Array.isArray(lists)) {
    console.warn("[listStorage] saveLists: se esperaba un array");
    return false;
  }
  return await storageClient.set(LISTS_KEY, lists);
}

/**
 * Devuelve una lista por id
 */
export async function getList(id) {
  const lists = await loadLists();
  return lists.find((l) => l.id === id) ?? null;
}

/**
 * Actualiza una lista usando una función
 */
export async function updateList(id, updater) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    const index = lists.findIndex((l) => l.id === id);

    if (index === -1) return lists;

    const updated = updater(lists[index]);
    lists[index] = updated;

    return lists;
  });
}

/**
 * Elimina una lista por id
 */
export async function deleteList(id) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    return lists.filter((l) => l.id !== id);
  });
}
