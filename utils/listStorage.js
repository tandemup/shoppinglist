//import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LISTS_KEY = "shopping_lists";

// -----------------------------
// Obtener todas las listas
// -----------------------------
export const getAllLists = async () => {
  try {
    const data = await AsyncStorage.getItem(LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error al obtener listas:", e);
    return [];
  }
};

// -----------------------------
// Crear nueva lista
// -----------------------------
export const createList = async (name, storeName = "") => {
  try {
    const lists = await getAllLists();

    const newList = {
      id: uuidv4(), // ✔ ID estable
      name: name?.trim() || "Nueva lista",
      storeName: storeName?.trim() || "",
      createdAt: new Date().toISOString(),
      items: [],
    };

    const updated = [newList, ...lists];

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));

    return newList;
  } catch (e) {
    console.error("Error al crear lista:", e);
    return null;
  }
};

// -----------------------------
// Obtener por ID
// -----------------------------
export const getListById = async (id) => {
  try {
    const lists = await getAllLists();
    return lists.find((l) => l.id === id) || null;
  } catch (e) {
    console.error("Error al obtener lista:", e);
    return null;
  }
};

// -----------------------------
// Guardar lista completa
// -----------------------------
export const saveList = async (list) => {
  try {
    const lists = await getAllLists();

    const updated = lists.some((l) => l.id === list.id)
      ? lists.map((l) => (l.id === list.id ? list : l))
      : [list, ...lists];

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error al guardar lista:", e);
  }
};

// -----------------------------
// Actualizar lista por ID
// -----------------------------
export const updateList = async (id, updatedList) => {
  try {
    const lists = await getAllLists();

    const updated = lists.some((l) => l.id === id)
      ? lists.map((l) => (l.id === id ? updatedList : l))
      : [updatedList, ...lists];

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error al actualizar lista:", e);
  }
};

// -----------------------------
// Añadir item a una lista
// -----------------------------
export const addItemToList = async (listId, item) => {
  try {
    const lists = await getAllLists();
    const updated = lists.map((l) =>
      l.id === listId ? { ...l, items: [item, ...l.items] } : l
    );

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error al añadir item:", e);
  }
};

// -----------------------------
// Actualizar item dentro de una lista
// -----------------------------
export const updateItemInList = async (listId, item) => {
  try {
    const lists = await getAllLists();
    const updated = lists.map((l) =>
      l.id === listId
        ? {
            ...l,
            items: l.items.map((i) => (i.id === item.id ? item : i)),
          }
        : l
    );

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error actualizando item:", e);
  }
};

// -----------------------------
// Eliminar item dentro de una lista
// -----------------------------
export const deleteItemFromList = async (listId, itemId) => {
  try {
    const lists = await getAllLists();
    const updated = lists.map((l) =>
      l.id === listId
        ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
        : l
    );

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error eliminando item:", e);
  }
};

// -----------------------------
// Eliminar lista completa
// -----------------------------
export const deleteList = async (id) => {
  try {
    const lists = await getAllLists();
    const filtered = lists.filter((l) => l.id !== id);
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error al eliminar lista:", e);
  }
};

// -----------------------------
// Borrar todas
// -----------------------------
export const clearAllLists = async () => {
  try {
    await AsyncStorage.removeItem(LISTS_KEY);
  } catch (e) {
    console.error("Error al limpiar listas:", e);
  }
};
