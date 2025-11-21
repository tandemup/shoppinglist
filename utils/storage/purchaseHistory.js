// utils/storage/purchaseHistory.js
import { storageClient } from "./storageClient";

const PURCHASES_KEY = "@expo-shop/purchases";

/**
 * Obtener historial de compras
 */
export async function getPurchases() {
  const data = await storageClient.get(PURCHASES_KEY);
  return Array.isArray(data) ? data : [];
}

/**
 * Añadir una compra nueva
 */
export async function addPurchase(purchase) {
  return await storageClient.update(PURCHASES_KEY, (current) => {
    const arr = Array.isArray(current) ? [...current] : [];
    return [...arr, purchase];
  });
}

/**
 * Eliminar una compra por id
 */
export async function deletePurchase(id) {
  return await storageClient.update(PURCHASES_KEY, (current) => {
    const arr = Array.isArray(current) ? [...current] : [];
    return arr.filter((p) => p.id !== id);
  });
}
