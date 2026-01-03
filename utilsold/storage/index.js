// utils/storage/index.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as listStorage from "./listStorage";
import * as settingsStorage from "./settingsStorage";
import { clearScannedHistory as clearScanHistoryModule } from "./scannerHistory";

const storage = {
  raw: {
    get: async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (err) {
        console.error("Storage.get error:", err);
        return null;
      }
    },

    set: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error("Storage.set error:", err);
      }
    },

    remove: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (err) {
        console.error("Storage.remove error:", err);
      }
    },

    clear: async () => {
      try {
        await AsyncStorage.clear();
      } catch (err) {
        console.error("Storage.clear error:", err);
      }
    },
  },

  lists: {
    getAll: listStorage.loadLists,
    add: listStorage.addList,
    remove: listStorage.deleteList,
    update: listStorage.updateList,
  },

  settings: {
    get: settingsStorage.getSetting,
    set: settingsStorage.setSetting,
  },
};

// -----------------------------
// FUNCIONES DE BORRADO EXTERNAS
// -----------------------------

async function clearAllLists() {
  await listStorage.clearActiveLists();
  await listStorage.clearArchivedLists();
}

async function clearActiveLists() {
  await listStorage.clearActiveLists();
}

async function clearArchivedLists() {
  await listStorage.clearArchivedLists();
}

async function clearPurchaseHistory() {
  await listStorage.clearPurchaseHistory();
}

async function clearScannedHistory() {
  await clearScanHistoryModule();
}

async function clearStorage() {
  await AsyncStorage.clear();
}

export {
  clearStorage,
  clearAllLists,
  clearActiveLists,
  clearArchivedLists,
  clearPurchaseHistory,
  clearScannedHistory,
};

export default storage;
