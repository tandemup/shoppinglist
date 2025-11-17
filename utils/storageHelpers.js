// utils/storageHelpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guarda una nueva lista de la compra en el historial
 * @param {Object} purchase - { date, store, items }
 */
export const savePurchase = async (purchase) => {
  try {
    const stored = await AsyncStorage.getItem('purchaseHistory');
    const history = stored ? JSON.parse(stored) : [];
    history.unshift(purchase); // la más reciente primero
    await AsyncStorage.setItem('purchaseHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error guardando compra:', error);
  }
};

/**
 * Obtiene todas las compras guardadas
 */
export const getPurchases = async () => {
  try {
    const stored = await AsyncStorage.getItem('purchaseHistory');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error cargando historial:', error);
    return [];
  }
};
