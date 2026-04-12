import { storage } from "../storage/storage";
import { STORAGE_KEYS } from "../storage/storageKeys";

/* -------------------------------------------------
   CASA
-------------------------------------------------- */
export async function saveHomeLocation(coords) {
  const payload = {
    coords,
    label: "Casa",
    timestamp: Date.now(),
  };

  await storage.setJSON(STORAGE_KEYS.HOME_LOCATION, payload);
}

export async function loadHomeLocation() {
  return await storage.getJSON(STORAGE_KEYS.HOME_LOCATION, null);
}

/* -------------------------------------------------
   TIENDA ACTUAL
-------------------------------------------------- */
export async function saveShoppingLocation({ coords, store }) {
  const payload = {
    coords,
    label: store?.name ?? "Tienda",
    storeId: store?.id ?? null,
    timestamp: Date.now(),
  };

  await storage.setJSON(STORAGE_KEYS.SHOPPING_LOCATION, payload);
}

export async function loadShoppingLocation() {
  return await storage.getJSON(STORAGE_KEYS.SHOPPING_LOCATION, null);
}

export async function clearShoppingLocation() {
  await storage.remove(STORAGE_KEYS.SHOPPING_LOCATION);
}
