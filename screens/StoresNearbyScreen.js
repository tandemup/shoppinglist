import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import StoreRow from "../components/StoreRow";

import { useStores } from "../context/StoresContext";
import { useLocation } from "../context/LocationContext";
import { ROUTES } from "../navigation/ROUTES";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function StoresNearbyScreen() {
  const navigation = useNavigation();

  const { stores } = useStores();
  const { location, requestLocation, isLoading, error } = useLocation();

  /* -------------------------------------------------
     Estados sin localización
  -------------------------------------------------- */
  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Mostrar tiendas cercanas</Text>

        <Text style={styles.subtitle}>
          Necesitamos acceder a tu ubicación para ordenar las tiendas por
          distancia.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={styles.button}
          onPress={requestLocation}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Obteniendo ubicación…" : "Usar mi ubicación"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!stores?.length) {
    return (
      <View style={styles.center}>
        <Text>No hay tiendas disponibles</Text>
      </View>
    );
  }

  /* -------------------------------------------------
     Tiendas con distancia (ordenadas + limitadas)
  -------------------------------------------------- */
  const nearbyStores = useMemo(() => {
    return stores
      .filter((s) => s.location?.latitude && s.location?.longitude)
      .map((store) => {
        const distanceKm = getDistanceKm(
          location.latitude,
          location.longitude,
          store.location.latitude,
          store.location.longitude
        );

        return { ...store, distanceKm };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10); // ⬅️ SOLO LAS MÁS CERCANAS
  }, [stores, location]);

  /* -------------------------------------------------
     Render item
  -------------------------------------------------- */
  const renderItem = ({ item }) => (
    <StoreRow store={item} onPress={() => handlePressStore(item)} />
  );

  return (
    <FlatList
      data={nearbyStores}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
    />
  );
}

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },

  error: {
    color: "#c62828",
    marginBottom: 12,
    textAlign: "center",
  },

  button: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    marginBottom: 12,
    fontSize: 14,
    color: "#555",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  city: {
    marginTop: 2,
    fontSize: 13,
    color: "#666",
  },

  distance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2e7d32",
    marginLeft: 8,
  },
});
