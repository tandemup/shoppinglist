import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

import { useStores } from "../context/StoresContext";

export default function StoreDetailScreen() {
  const route = useRoute();
  const { storeId } = route.params || {};

  const { getStoreById, toggleFavoriteStore, isFavoriteStore } = useStores();

  const store = getStoreById(storeId);

  if (!store) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Tienda no encontrada</Text>
      </View>
    );
  }

  const isFavorite = isFavoriteStore(store.id);

  /* -------------------------------------------------
     Abrir en Google Maps / Apple Maps
  -------------------------------------------------- */
  const openInMaps = () => {
    if (!store.location) return;

    const { latitude, longitude } = store.location;
    const label = encodeURIComponent(store.name);

    const url =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?ll=${latitude},${longitude}&q=${label}`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{store.name}</Text>

        <Pressable onPress={() => toggleFavoriteStore(store.id)} hitSlop={10}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={26}
            color={isFavorite ? "#f5c518" : "#bbb"}
          />
        </Pressable>
      </View>

      {/* DIRECCIÓN */}
      <Text style={styles.address}>{store.address}</Text>

      {/* MAPA */}
      {store.location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: store.location.latitude,
            longitude: store.location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          pointerEvents="none"
        >
          <Marker
            coordinate={store.location}
            title={store.name}
            description={store.address}
          />
        </MapView>
      )}

      {/* BOTÓN MAPAS */}
      {store.location && (
        <Pressable style={styles.mapsButton} onPress={openInMaps}>
          <Ionicons name="map-outline" size={18} color="#fff" />
          <Text style={styles.mapsButtonText}>Abrir en mapas</Text>
        </Pressable>
      )}

      {/* HORARIOS (estructura futura) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horario</Text>
        <Text style={styles.hoursText}>
          {store.hours ? "Ver horario semanal" : "Horario no disponible"}
        </Text>
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    fontSize: 16,
    color: "#666",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

  address: {
    marginTop: 8,
    fontSize: 14,
    color: "#444",
  },

  map: {
    height: 180,
    borderRadius: 12,
    marginVertical: 16,
  },

  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a7",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  mapsButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },

  section: {
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  hoursText: {
    marginTop: 4,
    fontSize: 14,
    color: "#555",
  },
});
