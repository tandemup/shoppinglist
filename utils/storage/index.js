import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./keys";

/* LISTAS */

export async function clearActiveLists() {
  await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_LISTS);
}

export async function clearArchivedLists() {
  await AsyncStorage.removeItem(STORAGE_KEYS.ARCHIVED_LISTS);
}

/* HISTORIALES */

export async function clearPurchaseHistory() {
  await AsyncStorage.removeItem(STORAGE_KEYS.PURCHASE_HISTORY);
}

export async function clearScannedHistory() {
  await AsyncStorage.removeItem(STORAGE_KEYS.SCANNED_HISTORY);
}

/* GLOBAL */

export async function clearStorage() {
  await AsyncStorage.clear();
}

export { STORAGE_KEYS };
