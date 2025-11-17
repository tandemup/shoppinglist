import AsyncStorage from "@react-native-async-storage/async-storage";

const LISTS_KEY = "shopping_lists"; // ✅ clave única y coherente

// 🧩 Obtener todas las listas
export const getAllLists = async () => {
  try {
    const data = await AsyncStorage.getItem(LISTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error al obtener listas:", e);
    return [];
  }
};

// 🧩 Crear nueva lista
export const createList = async (name, storeName = "") => {
  try {
    const lists = await getAllLists();
    const newList = {
      id: Date.now().toString(),
      name: name?.trim() || "Nueva lista",
      storeName: storeName?.trim() || "", // 🏪 nuevo campo
      createdAt: new Date().toISOString(),
      items: [],
    };
    const updatedLists = [newList, ...lists];
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(updatedLists));
    return newList;
  } catch (e) {
    console.error("Error al crear lista:", e);
    return null;
  }
};

// 🧩 Obtener lista por ID
export const getListById = async (id) => {
  try {
    const lists = await getAllLists();
    return lists.find((l) => String(l.id) === String(id)) || null;
  } catch (e) {
    console.error("Error al obtener lista:", e);
    return null;
  }
};

// 🧩 Guardar o actualizar lista
export const saveList = async (list) => {
  try {
    const lists = await getAllLists();
    const index = lists.findIndex((l) => String(l.id) === String(list.id));

    if (index >= 0) lists[index] = list;
    else lists.unshift(list);

    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error("Error al guardar lista:", e);
  }
};

// 🧩 Actualizar lista por ID
export const updateList = async (id, updatedList) => {
  try {
    const lists = await getAllLists();
    const index = lists.findIndex((l) => String(l.id) === String(id));
    if (index >= 0) lists[index] = updatedList;
    else lists.unshift(updatedList);
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error("Error al actualizar lista:", e);
  }
};

// 🧩 Eliminar lista
export const deleteList = async (id) => {
  try {
    const lists = await getAllLists();
    const filtered = lists.filter((l) => String(l.id) !== String(id));
    await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error al eliminar lista:", e);
  }
};

// 🧹 (Opcional) Borrar todas las listas
export const clearAllLists = async () => {
  try {
    await AsyncStorage.removeItem(LISTS_KEY);
  } catch (e) {
    console.error("Error al limpiar listas:", e);
  }
};
