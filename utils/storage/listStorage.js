// utils/storage/listStorage.js
import { storageClient } from "./storageClient";

const LISTS_KEY = "@expo-shop/lists";

// Carga básica (siempre array válido)
export async function loadLists() {
  const lists = await storageClient.get(LISTS_KEY);
  return Array.isArray(lists) ? lists : [];
}

// Guarda listas directamente
async function save(listArray) {
  await storageClient.set(LISTS_KEY, listArray);
  return listArray;
}

// Crear lista
export async function addList(newList) {
  const lists = await loadLists();
  const updated = [...lists, newList];
  return await save(updated);
}

// Borrar lista
export async function deleteList(id) {
  const lists = await loadLists();
  const updated = lists.filter((l) => l.id !== id);
  return await save(updated);
}

// Obtener lista por ID
export async function getList(id) {
  const lists = await loadLists();
  const found = lists.find((l) => l.id === id);

  // Blindaje: si la lista existe pero tiene items = undefined → repáralo
  if (found) {
    return {
      ...found,
      items: Array.isArray(found.items) ? found.items : [],
    };
  }

  return null;
}

// ACTUALIZAR UNA LISTA POR ID
export async function updateList(id, updater) {
  const lists = await loadLists();
  const index = lists.findIndex((l) => l.id === id);

  let base;

  if (index === -1) {
    // Crear la lista si no existe
    base = { id, name: "Nueva lista", items: [] };
    lists.push(base);
  } else {
    // Reparar lista corrupta o incompleta
    const l = lists[index];
    base = {
      ...l,
      items: Array.isArray(l.items) ? l.items : [],
    };
  }

  // Aplicar la actualización del usuario
  const updated = updater(base);

  // Reparar resultante
  lists[index === -1 ? lists.length - 1 : index] = {
    ...updated,
    items: Array.isArray(updated.items) ? updated.items : [],
  };

  return await save(lists);
}
