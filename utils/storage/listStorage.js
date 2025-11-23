// utils/storage/listStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "shoppingLists";

export async function loadLists() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error loading lists:", err);
    return [];
  }
}

export async function addList(list) {
  try {
    const lists = await loadLists();
    const newLists = [...lists, list];
    await AsyncStorage.setItem(KEY, JSON.stringify(newLists));
  } catch (err) {
    console.error("Error adding list:", err);
  }
}

export async function deleteList(id) {
  try {
    const lists = await loadLists();
    const newLists = lists.filter((l) => l.id !== id);
    await AsyncStorage.setItem(KEY, JSON.stringify(newLists));
  } catch (err) {
    console.error("Error deleting list:", err);
  }
}

export async function updateList(id, updates) {
  try {
    const lists = await loadLists();
    const newLists = lists.map((l) => (l.id === id ? { ...l, ...updates } : l));
    await AsyncStorage.setItem(KEY, JSON.stringify(newLists));
  } catch (err) {
    console.error("Error updating list:", err);
  }
}
