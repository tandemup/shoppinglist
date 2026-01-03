import { storageClient } from "./storageClient";

export async function clearAllStorage() {
  const KEYS = [
    "@expo-shop/lists",
    "@expo-shop/purchases",
    "@expo-shop/history",
    "@expo-shop/store",
    "appSettings",
    "shoppingLists",
    "shopping_lists",
    "lists",
    "scanned_history",
  ];

  for (const key of KEYS) {
    await storageClient.remove(key);
  }

  console.log("Storage limpiado completamente");
}
