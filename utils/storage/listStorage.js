// utils/storage/listStorage.js
import { storageClient } from "./storageClient";

const LISTS_KEY = "@expo-shop/lists";

/**
 * Cargar todas las listas almacenadas
 */
export async function loadLists() {
  const lists = await storageClient.get(LISTS_KEY);
  return Array.isArray(lists) ? lists : [];
}

/**
 * Guardar todas las listas (sobrescribe completamente)
 */
export async function saveLists(lists) {
  if (!Array.isArray(lists)) {
    console.warn("[listStorage] saveLists: se esperaba un array");
    return false;
  }
  return await storageClient.set(LISTS_KEY, lists);
}

/**
 * Obtener una lista por id
 */
export async function getList(id) {
  const lists = await loadLists();
  return lists.find((l) => l.id === id) ?? null;
}

/**
 * Actualizar una lista aplicando un callback
 */
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

/**
 * Eliminar una lista por id
 */
export async function deleteList(id) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    return lists.filter((l) => l.id !== id);
  });
}

/**
 * Crear una nueva lista
 */
export async function addList(newList) {
  return await storageClient.update(LISTS_KEY, (current) => {
    const lists = Array.isArray(current) ? [...current] : [];
    return [...lists, newList];
  });
}
