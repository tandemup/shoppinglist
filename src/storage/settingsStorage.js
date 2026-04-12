import { asyncStorageClient } from "./asyncStorageClient";
import { STORAGE_KEYS } from "./storageKeys";
import { DEFAULT_ENGINE } from "../constants/searchEngines";

async function getSearchEngine() {
  return await asyncStorageClient.getString(
    STORAGE_KEYS.SEARCH_ENGINE,
    DEFAULT_ENGINE,
  );
}

async function setSearchEngine(engineKey) {
  return await asyncStorageClient.setString(
    STORAGE_KEYS.SEARCH_ENGINE,
    engineKey,
  );
}

async function getSearchSettings() {
  return await asyncStorageClient.getJSON(STORAGE_KEYS.SEARCH_SETTINGS, {
    generalEngine: DEFAULT_ENGINE,
    bookEngine: DEFAULT_ENGINE,
  });
}

async function updateSearchSettings(partialSettings) {
  return await asyncStorageClient.mergeJSON(
    STORAGE_KEYS.SEARCH_SETTINGS,
    partialSettings,
  );
}

export const settingsStorage = {
  getSearchEngine,
  setSearchEngine,
  getSearchSettings,
  updateSearchSettings,
};
