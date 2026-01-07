// utils/storage/settingsStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "appSettings";

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Error loading settings:", err);
    return {};
  }
}

export async function getSetting(name) {
  try {
    const settings = await loadSettings();
    return settings[name];
  } catch (err) {
    console.error(`Error getting setting '${name}':`, err);
    return null;
  }
}

export async function setSetting(name, value) {
  try {
    const settings = await loadSettings();
    const newSettings = { ...settings, [name]: value };
    await AsyncStorage.setItem(KEY, JSON.stringify(newSettings));
  } catch (err) {
    console.error(`Error setting '${name}':`, err);
  }
}
