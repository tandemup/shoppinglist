import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTES } from "../navigation/ROUTES";

import {
  haversineDistance,
  getCurrentLocation,
} from "../utils/locationHelpers";
import StoreCard from "../components/StoreCard";
import SearchBar from "../components/SearchBar";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const normalizeOSMStore = (node) => {
  const tags = node.tags ?? {};

  const street = tags["addr:street"];
  const number = tags["addr:housenumber"];
  const postcode = tags["addr:postcode"];
  const city = tags["addr:city"];

  return {
    id: `osm-${node.id}`,

    name: tags.name ?? "Tienda sin nombre",
    type: tags.shop ?? "unknown",
    brand: tags.brand ?? null,

    // 📍 Coordenadas
    location: {
      latitude: node.lat,
      longitude: node.lon,
    },

    // 🏠 Dirección postal
    address: {
      street,
      number,
      postcode,
      city,
      full:
        tags["addr:full"] ??
        [street, number, postcode, city].filter(Boolean).join(", "),
    },

    // 🌐 URL / web
    website: tags.website ?? tags["contact:website"] ?? tags.url ?? null,

    source: "osm",
  };
};

export default function StoresScreen({ route, navigation }) {
  // ────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [sortedStores, setSortedStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    setSortedStores(stores);
  }, [stores]);

  // ────────────────────────────────────────────────
  // FILTRADO
  // ────────────────────────────────────────────────
  const filteredStores = sortedStores.filter((store) => {
    const q = search.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.type.toLowerCase().includes(q) ||
      store.address?.full?.toLowerCase().includes(q)
    );
  });

  const fetchStores = async () => {
    try {
      setLoading(true);

      const query = `
[out:json];
(
  node["shop"="supermarket"](around:1500,43.532687,-5.66107);
  node["shop"="convenience"](around:1500,43.532687,-5.66107);
  node["shop"="grocery"](around:1500,43.532687,-5.66107);
);
out body;
`;

      const response = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      const json = await response.json();
      setStores((json.elements ?? []).map(normalizeOSMStore));
    } catch (e) {
      console.error("Error fetching stores", e);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  // HANDLERS
  // ────────────────────────────────────────────────
  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (!location) return;

    setUserLocation(location);

    const withDistances = stores.map((s) => ({
      ...s,
      distance: haversineDistance(location, s.location),
    }));

    withDistances.sort((a, b) => a.distance - b.distance);
    setSortedStores(withDistances);
  };

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tiendas</Text>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar tienda…"
        style={{ marginBottom: 12 }}
      />

      <Pressable style={styles.button} onPress={fetchStores}>
        <Text style={styles.buttonText}>Buscar tiendas</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { backgroundColor: "#2196F3" }]}
        onPress={handleGetLocation}
      >
        <Text style={styles.buttonText}>📍 Usar mi ubicación</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" />}
      <ScrollView contentContainerStyle={styles.list}>
        {filteredStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            onPress={(selected) =>
              navigation.navigate(ROUTES.STORE_DETAIL, { store: selected })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 16,
  },

  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },

  list: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#666",
  },
  coords: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  link: {
    fontSize: 12,
    color: "#2e7dff",
    marginTop: 4,
  },
});
