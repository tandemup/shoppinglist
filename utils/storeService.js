// /utils/storeService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_STORE_KEY = "LAST_SELECTED_STORE";

// 💾 Guardar tienda seleccionada
export async function saveSelectedStore(store) {
  try {
    await AsyncStorage.setItem(LAST_STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.log("Error guardando tienda:", e);
  }
}

// 📥 Cargar la última tienda guardada
export async function loadSelectedStore() {
  try {
    const json = await AsyncStorage.getItem(LAST_STORE_KEY);
    return json ? JSON.parse(json) : null;
  } catch (e) {
    console.log("Error cargando tienda:", e);
    return null;
  }
}

// 🗑️ Borrar tienda guardada (si lo necesitas)
export async function clearSelectedStore() {
  try {
    await AsyncStorage.removeItem(LAST_STORE_KEY);
  } catch (e) {
    console.log("Error borrando tienda:", e);
  }
}
