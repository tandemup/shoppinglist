import { haversineDistance } from "./locationHelpers";

const STORE_RADIUS_KM = 0.1; // 100 metros

export function detectStorePresence(userCoords, stores) {
  if (!userCoords || !Array.isArray(stores)) return null;

  for (const store of stores) {
    if (!store?.location) continue;

    const distance = haversineDistance(userCoords, store.location);

    if (distance <= STORE_RADIUS_KM) {
      return store;
    }
  }

  return null;
}
