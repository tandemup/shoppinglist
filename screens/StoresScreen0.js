// screens/StoresScreen.js
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  haversineDistance,
  getCurrentLocation,
} from "../utils/locationHelpers";
import stores from "../data/stores.json";

export default function StoresScreen({ route, navigation }) {
  const { onSelectStore } = route.params || {};

  const [userLocation, setUserLocation] = useState(null);
  const [distances, setDistances] = useState({});
  const [sortedStores, setSortedStores] = useState(stores);
  const [search, setSearch] = useState("");

  // 👉 Callback puro sin Zustand
  const handleSelectStore = (store) => {
    if (onSelectStore) {
      onSelectStore(store); // devolvemos la tienda a ShoppingListScreen
    }
    navigation.goBack();
  };

  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    setUserLocation(location);

    const newDistances = {};
    const withDistances = stores.map((s) => {
      const d = haversineDistance(location, s.location);
      newDistances[s.id] = d;
      return { ...s, distance: d };
    });

    const ordered = withDistances.sort((a, b) => a.distance - b.distance);
    setDistances(newDistances);
    setSortedStores(ordered);
  };

  const filteredStores = sortedStores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Tiendas</Text>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleGetLocation}
        >
          <Text style={styles.locationButtonText}>📍 Usar mi ubicación</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#777"
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tienda..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredStores.length === 0 ? (
            <Text style={styles.noResults}>No se encontraron tiendas.</Text>
          ) : (
            filteredStores.map((store) => {
              const distance = distances[store.id];
              return (
                <TouchableOpacity
                  key={store.id}
                  style={styles.card}
                  onPress={() => handleSelectStore(store)}
                >
                  <View style={styles.checkbox}>
                    <Ionicons name="storefront" size={16} color="#fff" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{store.name}</Text>
                    <Text style={styles.address}>📍 {store.address}</Text>
                    {typeof distance === "number" ? (
                      <Text style={styles.desc}>
                        A {distance.toFixed(2)} km
                      </Text>
                    ) : (
                      <Text style={styles.desc}>Distancia no disponible</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// 🎨 Estilos (sin cambios)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f7f9fc" },
  container: { flex: 1, padding: 16 },
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
    marginBottom: 12,
    alignItems: "center",
  },
  locationButtonText: { color: "white", fontWeight: "600" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  scrollContent: { paddingBottom: 80 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  activeCard: { borderColor: "#007bff" },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#bbb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  name: { fontSize: 16, fontWeight: "700", color: "#111" },
  address: { fontSize: 13, color: "#444", marginTop: 2, lineHeight: 18 },
  desc: { fontSize: 13, color: "#666", marginTop: 4 },
  noResults: {
    textAlign: "center",
    color: "#666",
    marginTop: 40,
    fontSize: 15,
  },
});
