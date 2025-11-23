// utils/storage/index.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as listStorage from "./listStorage";
import * as settingsStorage from "./settingsStorage";

const storage = {
  //
  // 📦 Métodos RAW (útiles para debug y operaciones genéricas)
  //
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

  //
  // 📂 Módulos especializados
  //
  lists: {
    getAll: listStorage.loadLists,
    add: listStorage.addList,
    remove: listStorage.deleteList,
    update: listStorage.updateList, // si quieres implementarlo después
  },

  settings: {
    get: settingsStorage.getSetting,
    set: settingsStorage.setSetting,
  },
};

export default storage;
