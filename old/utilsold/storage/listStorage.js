// utils/storage/listStorage.js
import { storageClient } from "./storageClient";

const LISTS_KEY = "@expo-shop/lists";

// -----------------------------
// LÓGICA BASE DE LISTAS
// -----------------------------
export async function loadLists() {
  const lists = await storageClient.get(LISTS_KEY);
  return Array.isArray(lists) ? lists : [];
}

async function save(listArray) {
  await storageClient.set(LISTS_KEY, listArray);
  return listArray;
}

export async function addList(newList) {
  const lists = await loadLists();
  const updated = [...lists, newList];
  return await save(updated);
}

export async function deleteList(id) {
  const lists = await loadLists();
  const updated = lists.filter((l) => l.id !== id);
  return await save(updated);
}

export async function getList(id) {
  const lists = await loadLists();
  const found = lists.find((l) => l.id === id);

  if (found) {
    return {
      ...found,
      items: Array.isArray(found.items) ? found.items : [],
    };
  }

  return null;
}

export async function updateList(id, updater) {
  const lists = await loadLists();
  const index = lists.findIndex((l) => l.id === id);

  let base;

  if (index === -1) {
    base = { id, name: "Nueva lista", items: [] };
    lists.push(base);
  } else {
    const l = lists[index];
    base = {
      ...l,
      items: Array.isArray(l.items) ? l.items : [],
    };
  }

  const updated = updater(base);

  lists[index === -1 ? lists.length - 1 : index] = {
    ...updated,
    items: Array.isArray(updated.items) ? updated.items : [],
  };

  return await save(lists);
}

export async function saveLists(listArray) {
  return await save(listArray);
}

// -----------------------------
// FUNCIONES DE BORRADO
// -----------------------------

// 🗑 Borrar SOLO listas activas (archived = false)
export async function clearActiveLists() {
  const lists = await loadLists();
  const remaining = lists.filter((l) => l.archived === true);
  await storageClient.set(LISTS_KEY, remaining);
}

// 🗑 Borrar SOLO listas archivadas (archived = true)
export async function clearArchivedLists() {
  const lists = await loadLists();
  const remaining = lists.filter((l) => l.archived !== true);
  await storageClient.set(LISTS_KEY, remaining);
}

// 🗑 Borrar historial de compras (no pertenece aquí, pero lo exponemos)
export async function clearPurchaseHistory() {
  await storageClient.set("@expo-shop/purchases", []);
}
