// utils/storageHelpers.js
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "scanned_history";

/**
 * Guarda una nueva lista de la compra en el historial
 * @param {Object} purchase - { date, store, items }
 */
export const savePurchase = async (purchase) => {
  try {
    const stored = await AsyncStorage.getItem("purchaseHistory");
    const history = stored ? JSON.parse(stored) : [];
    history.unshift(purchase); // la más reciente primero
    await AsyncStorage.setItem("purchaseHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Error guardando compra:", error);
  }
};

/**
 * Obtiene todas las compras guardadas
 */
export const getPurchases = async () => {
  try {
    const stored = await AsyncStorage.getItem("purchaseHistory");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error cargando historial:", error);
    return [];
  }
};

export async function getScannedProducts() {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export async function updateScannedProduct(id, updates) {
  const list = await getScannedProducts();
  const index = list.findIndex((item) => item.id === id);

  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    await AsyncStorage.setItem(KEY, JSON.stringify(list));
  }

  return list[index];
}

export async function deleteScannedProduct(id) {
  const list = await getScannedProducts();
  const newList = list.filter((item) => item.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(newList));
}

export async function addScannedProduct(product) {
  const list = await getScannedProducts();

  // ❗ Buscar si ya existe un item con este mismo código de barras
  const existingIndex = list.findIndex((item) => item.code === product.code);

  if (existingIndex !== -1) {
    // Ya existe → actualizar el registro existente
    list[existingIndex] = {
      ...list[existingIndex],
      ...product,
      updatedAt: Date.now(),
    };
  } else {
    // No existe → crear nuevo con UUID
    list.unshift({
      id: uuidv4(),
      ...product,
      date: Date.now(),
    });
  }

  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}
