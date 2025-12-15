import { haversineDistance } from "./locationHelpers";

const STORE_RADIUS_KM = 0.1; // 100 metros

export function isUserInStore(userCoords, store) {
  if (!userCoords || !store?.location) return false;

  const distance = haversineDistance(userCoords, store.location);

  return distance <= STORE_RADIUS_KM;
}
