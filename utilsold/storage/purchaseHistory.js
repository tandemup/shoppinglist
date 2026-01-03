import { storageClient } from "./storageClient";

const PURCHASES_KEY = "@expo-shop/purchases";

// -----------------------------
// HISTORIAL DE COMPRAS
// -----------------------------
export async function getPurchases() {
  const data = await storageClient.get(PURCHASES_KEY);
  return Array.isArray(data) ? data : [];
}

export async function addPurchase(purchase) {
  return await storageClient.update(PURCHASES_KEY, (current) => {
    const arr = Array.isArray(current) ? [...current] : [];
    return [...arr, purchase];
  });
}

export async function deletePurchase(id) {
  return await storageClient.update(PURCHASES_KEY, (current) => {
    const arr = Array.isArray(current) ? [...current] : [];
    return arr.filter((p) => p.id !== id);
  });
}

// 🗑 Borrar todo el historial de compras
export async function clearPurchaseHistory() {
  await storageClient.set(PURCHASES_KEY, []);
}
