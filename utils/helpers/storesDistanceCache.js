import AsyncStorage from "@react-native-async-storage/async-storage";

const STORES_DISTANCE_KEY = "@expo-shop/stores-distance";
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutos

export async function saveStoresDistance({ userLocation, stores }) {
  const payload = {
    userLocation,
    stores,
    timestamp: Date.now(),
  };

  await AsyncStorage.setItem(STORES_DISTANCE_KEY, JSON.stringify(payload));
}

export async function loadStoresDistance() {
  const raw = await AsyncStorage.getItem(STORES_DISTANCE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (!parsed?.timestamp) return null;

  const expired = Date.now() - parsed.timestamp > MAX_AGE_MS;
  if (expired) return null;

  return parsed;
}

export async function clearStoresDistance() {
  await AsyncStorage.removeItem(STORES_DISTANCE_KEY);
}
