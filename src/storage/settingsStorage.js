import { storage } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export async function getSearchEngine() {
  return await storage.getString(STORAGE_KEYS.SEARCH_ENGINE);
}

export async function setSearchEngine(engineKey) {
  return await storage.setString(STORAGE_KEYS.SEARCH_ENGINE, engineKey);
}

export async function getSearchSettings() {
  return await storage.getJSON(STORAGE_KEYS.SEARCH_SETTINGS, {
    generalEngine: "google",
    bookEngine: "google",
  });
}
