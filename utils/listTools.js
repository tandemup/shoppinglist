// utils/listTools.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lists";

export const updateListById = async (listId, updaterFn) => {
  const raw = await AsyncStorage.getItem(KEY);
  const lists = raw ? JSON.parse(raw) : [];

  const index = lists.findIndex((l) => l.id === listId);
  if (index < 0) return false;

  // aplicar cambios
  updaterFn(lists[index]);

  await AsyncStorage.setItem(KEY, JSON.stringify(lists));
  return true;
};
