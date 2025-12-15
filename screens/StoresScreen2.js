import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import SearchBar from "../components/SearchBar";
import { filterStoresBySearch } from "../utils/storeSearchHelper";
import stores from "../data/stores.json";
import {
  getCurrentLocation,
  haversineDistance,
} from "../utils/locationHelpers";
import { ROUTES } from "../navigation/ROUTES";
import { isUserInStore } from "../utils/isUserInStore";
import { detectStorePresence } from "../utils/storePresence";
import { saveShoppingLocation } from "../utils/locationPlacesService";

export default function StoresScreen({ route, navigation }) {
  // ────────────────────────────────────────────────
  // PARAMS
  // ────────────────────────────────────────────────
  const { onSelectStore, selectedStore } = route.params ?? {};
  const isSelectionMode = typeof onSelectStore === "function";

  // ────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────
  const [sortedStores, setSortedStores] = useState(stores);
  const [search, setSearch] = useState("");
  const [hasLocation, setHasLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // ────────────────────────────────────────────────
  // NORMALIZE SELECTED STORE
  // ────────────────────────────────────────────────
  const normalizedSelectedStore =
    typeof selectedStore === "string"
      ? selectedStore.toLowerCase()
      : selectedStore?.name?.toLowerCase();

  // ────────────────────────────────────────────────
  // HANDLERS
  // ────────────────────────────────────────────────
  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    setUserLocation(location);
    recalcDistances(location);
    setHasLocation(true);

    // Detectar si está dentro de una tienda y guardarla
    const store = detectStorePresence(location, stores);
    if (store) {
      await saveShoppingLocation({
        coords: location,
        store,
      });
    }
  };

  const recalcDistances = (location) => {
    const updated = stores.map((store) => ({
      ...store,
      distance: haversineDistance(location, store.location),
    }));

    updated.sort((a, b) => a.distance - b.distance);
    setSortedStores(updated);
  };

  const handleSelectStore = (store) => {
    if (!isSelectionMode) return;

    onSelectStore?.(store);
    navigation.goBack();
  };

  // ────────────────────────────────────────────────
  // FILTER
  // ────────────────────────────────────────────────
  const filteredStores = filterStoresBySearch(sortedStores, search);

  // ────────────────────────────────────────────────
  // EFFECTS
  // ────────────────────────────────────────────────
  useEffect(() => {
    setSortedStores(stores);
  }, []);

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Tiendas</Text>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() =>
          navigation.navigate(ROUTES.STORE_MAP, {
            stores: filteredStores,
            userLocation,
          })
        }
      >
        <Ionicons name="map-outline" size={18} color="white" />
        <Text style={styles.mapButtonText}>Ver tiendas en el mapa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleGetLocation}
      >
        <Text style={styles.locationButtonText}>📍 Usar mi ubicación</Text>
      </TouchableOpacity>

      {hasLocation ? (
        <Text style={styles.locationInfo}>
          📍 Distancias calculadas según tu ubicación
        </Text>
      ) : (
        <Text style={styles.hint}>
          Pulsa para ver la distancia a cada tienda
        </Text>
      )}

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar tienda…"
        style={{ marginBottom: 12 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredStores.length === 0 ? (
          <Text style={styles.noResults}>No se encontraron tiendas.</Text>
        ) : (
          filteredStores.map((store) => {
            const isHighlighted =
              normalizedSelectedStore &&
              store.name.toLowerCase().includes(normalizedSelectedStore);

            const isHere = hasLocation && isUserInStore(userLocation, store);

            return (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.card,
                  isHighlighted && styles.activeCard,
                  isHere && styles.hereCard,
                ]}
                onPress={() => handleSelectStore(store)}
              >
                <Text style={styles.name}>{store.name}</Text>
                <Text style={styles.address}>📍 {store.address}</Text>

                {store.distance != null && (
                  <Text style={styles.distance}>
                    📏 A {store.distance.toFixed(2)} km
                  </Text>
                )}

                {isHere && (
                  <Text style={styles.hereLabel}>🟢 Estás en esta tienda</Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────
// 🎨 STYLES
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 10,
  },
  locationButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: "center",
  },
  locationButtonText: {
    color: "white",
    fontWeight: "600",
  },
  locationInfo: {
    textAlign: "center",
    fontSize: 12,
    color: "#2e7d32",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: "#777",
    marginBottom: 10,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  activeCard: {
    borderColor: "#007bff",
    borderWidth: 2,
    backgroundColor: "#f0f6ff",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  address: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
    lineHeight: 18,
  },
  distance: {
    fontSize: 13,
    color: "#2e7d32",
    marginTop: 4,
    fontWeight: "600",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 15,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  mapButtonText: {
    color: "white",
    fontWeight: "600",
  },
  hereCard: {
    borderColor: "#2e7d32",
    borderWidth: 2,
    backgroundColor: "#f1fbf3",
  },
  hereLabel: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#2e7d32",
  },
});
