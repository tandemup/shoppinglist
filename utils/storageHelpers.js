// utils/storageHelpers.js
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

export const getScannedProducts = async () => {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};
export const addScannedProduct = async (product) => {
  const current = await getScannedProducts();

  // Buscar si ya existe
  const existingIndex = current.findIndex((p) => p.code === product.code);

  if (existingIndex !== -1) {
    // Ya existe → incrementar contador
    const existing = current[existingIndex];
    const updated = {
      ...existing,
      count: (existing.count || 1) + 1,
      // OPCIONAL: actualizar fecha de último escaneo
      date: new Date().toISOString(),
    };

    current[existingIndex] = updated;

    await AsyncStorage.setItem(KEY, JSON.stringify(current));
    return;
  }

  // NO existe → crear nuevo registro con count: 1
  const newEntry = {
    id: Date.now().toString(),
    code: product.code,
    name: product.name || "Producto desconocido",
    brand: product.brand || "",
    image: product.image || null,
    url: product.url || "",
    date: new Date().toISOString(),
    count: 1,
  };

  await AsyncStorage.setItem(KEY, JSON.stringify([newEntry, ...current]));
};

export const deleteScannedProduct = async (id) => {
  const current = await getScannedProducts();
  const updated = current.filter((p) => p.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
};
