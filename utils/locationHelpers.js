import * as Location from "expo-location";
import { getCachedLocation, setCachedLocation } from "./locationCache";

/**
 * Obtiene la ubicación del usuario usando caché si es válida.
 * @param {Object} options
 * @param {boolean} options.force - Fuerza GPS ignorando caché
 */
export async function getCurrentLocation({ force = false } = {}) {
  // 1️⃣ Intentar caché
  if (!force) {
    const cached = await getCachedLocation();
    if (cached) {
      console.log("📍 Using CACHED location");
      return cached;
    }
  }

  console.log("📍 Using GPS location");

  // 2️⃣ Pedir permisos
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return null;
  }

  // 3️⃣ Obtener ubicación real
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const coords = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  // 4️⃣ Guardar en caché
  await setCachedLocation(coords);

  return coords;
}

/**
 * Calcula distancia Haversine en km entre dos puntos
 */
export function haversineDistance(a, b) {
  if (!a || !b) return null;

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km

  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}
