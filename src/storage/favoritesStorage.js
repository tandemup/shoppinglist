import { asyncStorageClient } from "./asyncStorageClient";
import { STORAGE_KEYS } from "./storageKeys";

async function getFavorites() {
  return await asyncStorageClient.getJSON(STORAGE_KEYS.FAVORITES, []);
}

async function saveFavorites(favorites) {
  return await asyncStorageClient.setJSON(STORAGE_KEYS.FAVORITES, favorites);
}

export const favoritesStorage = {
  getFavorites,
  saveFavorites,
};
