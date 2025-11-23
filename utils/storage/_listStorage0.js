// utils/storage/listStorage.js
import { storageClient } from "./storageClient";

const LISTS_KEY = "@expo-shop/lists";

export async function loadLists() {
  const lists = await storageClient.get(LISTS_KEY);
  return Array.isArray(lists) ? lists : [];
}

export async function addList(newList) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    return [...lists, newList];
  });
}

export async function deleteList(id) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    return lists.filter((l) => l.id !== id);
  });
}

export async function updateList(id, updater) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    const index = lists.findIndex((l) => l.id === id);

    // Si no existe, devolvemos la lista intacta
    if (index === -1) return lists;

    // Actualizar la lista usando la función provista
    const updated = updater(lists[index]);
    lists[index] = updated;

    return lists;
  });
}

export async function saveLists(lists) {
  if (!Array.isArray(lists)) {
    console.warn("[listStorage] saveLists: se esperaba un array");
    return false;
  }
  return await storageClient.set(LISTS_KEY, lists);
}

export async function getList(id) {
  const lists = await loadLists();
  return lists.find((l) => l.id === id) ?? null;
}
