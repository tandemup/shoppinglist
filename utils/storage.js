import AsyncStorage from '@react-native-async-storage/async-storage';
export const STORAGE_KEY = 'shoppinglist.v2.items';
export async function loadList() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
export async function saveList(items) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
