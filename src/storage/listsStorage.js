import { asyncStorageClient } from "./asyncStorageClient";
import { STORAGE_KEYS } from "./storageKeys";

async function getLists() {
  return await asyncStorageClient.getJSON(STORAGE_KEYS.LISTS, []);
}

async function saveLists(lists) {
  return await asyncStorageClient.setJSON(STORAGE_KEYS.LISTS, lists);
}

async function getHistory() {
  return await asyncStorageClient.getJSON(STORAGE_KEYS.HISTORY, []);
}

async function saveHistory(history) {
  return await asyncStorageClient.setJSON(STORAGE_KEYS.HISTORY, history);
}

export const listsStorage = {
  getLists,
  saveLists,
  getHistory,
  saveHistory,
};
