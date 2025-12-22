import * as Location from "expo-location";
import { getCachedLocation, setCachedLocation } from "./locationCache";

/**
 * Obtiene la ubicación del usuario usando caché si es válida
 */
export async function getCurrentLocation({ force = false } = {}) {
  if (!force) {
    const cached = await getCachedLocation();
    if (cached?.coords) {
      console.log("📍 Using CACHED location");
      return {
        ...cached.coords,
        _timestamp: cached.timestamp,
      };
    }
  }

  console.log("📍 Using GPS location");

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const coords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  await setCachedLocation(coords);
  return coords;
}

/**
 * Distancia Haversine en kilómetros
 */
export function haversineDistance(a, b) {
  if (!a || !b) return null;

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // radio Tierra en km

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Alias semántico (por claridad en pantallas)
 */
export const getDistanceKm = haversineDistance;
