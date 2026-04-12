import { storage } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export async function getSearchSettings() {
  return await storage.getJSON(STORAGE_KEYS.SEARCH_SETTINGS, {
    generalEngine: "google",
    bookEngine: "google",
  });
}

export async function setSearchSettings(settings) {
  return await storage.setJSON(STORAGE_KEYS.SEARCH_SETTINGS, settings);
}
