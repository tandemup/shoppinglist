import * as Location from "expo-location";
import { safeAlert } from "./safeAlert";

// 📏 Calcular distancia Haversine (en km)
export function haversineDistance__(loc1, loc2) {
  if (!loc1 || !loc2) return null;

  const R = 6371; // Radio de la Tierra en km

  const dLat = deg2rad(loc2.latitude - loc1.latitude);
  const dLon = deg2rad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(loc1.latitude)) *
      Math.cos(deg2rad(loc2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// 📏 Calcular distancia entre coordenadas (Haversine)
export const haversineDistance = (coords1, coords2) => {
  if (
    !coords1 ||
    !coords2 ||
    typeof coords1.latitude !== "number" ||
    typeof coords1.longitude !== "number" ||
    typeof coords2.latitude !== "number" ||
    typeof coords2.longitude !== "number"
  ) {
    console.warn("⚠️ Coordenadas inválidas:", coords1, coords2);
    return null;
  }

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 📍 Obtener ubicación actual del usuario
export async function getCurrentLocation__0() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permiso de ubicación denegado");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (e) {
    console.log("Error obteniendo ubicación:", e);
    return null;
  }
}

// 📍 Obtener ubicación actual del usuario
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      safeAlert("Permiso denegado", "No se puede obtener la ubicación.");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    if (!location?.coords) {
      throw new Error("Coordenadas no disponibles");
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error obteniendo ubicación:", error);
    safeAlert("Error", "No se pudo obtener la ubicación actual.");
    return null;
  }
};

// 🧭 Obtener la tienda más cercana
export const getNearestStore = (currentCoords, stores) => {
  if (!currentCoords || !Array.isArray(stores) || stores.length === 0)
    return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const store of stores) {
    // 🔹 compatibilidad: admite tanto store.location como store.coords
    const coords = store.location || store.coords;
    const distance = haversineDistance(currentCoords, coords);

    if (typeof distance === "number" && distance < minDistance) {
      minDistance = distance;
      nearest = { ...store, distance };
    }
  }

  return nearest
    ? { ...nearest, distance: Number(minDistance.toFixed(3)) }
    : null;
};
