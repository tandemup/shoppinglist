import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@expo-shop/store-stats";

export async function recordStoreVisit(store) {
  const raw = await AsyncStorage.getItem(KEY);
  const stats = raw ? JSON.parse(raw) : {};

  const id = store.id;

  stats[id] = {
    storeId: id,
    name: store.name,
    visits: (stats[id]?.visits || 0) + 1,
    lastVisit: Date.now(),
  };

  await AsyncStorage.setItem(KEY, JSON.stringify(stats));
}

export async function getStoreStats() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}
