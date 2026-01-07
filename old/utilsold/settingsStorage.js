// utils/settingsStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "@expo-shop/search-settings";

const DEFAULT_SETTINGS = {
  bookEngines: {
    googleBooks: true,
    openLibrary: true,
    amazonBooks: false,
    goodreads: false,
  },
  productEngines: {
    googleShopping: true,
    amazon: false,
    openFoodFacts: true,
    idealo: false,
  },
};

export const loadSettings = async () => {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  } catch (err) {
    console.log("❌ Error loading settings:", err);
    return DEFAULT_SETTINGS;
  }
};
