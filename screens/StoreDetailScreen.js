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
import { SafeAreaView } from "react-native-safe-area-context";

export default function StoreDetailScreen({ route, navigation }) {
  const { store } = route.params ?? {};

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>No hay información de la tienda</Text>
      </SafeAreaView>
    );
  }

  const openMaps = () => {
    const { latitude, longitude } = store.location;
    const label = encodeURIComponent(store.name);

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{store.name}</Text>

        <Text style={styles.type}>
          {store.type}
          {store.brand ? ` · ${store.brand}` : ""}
        </Text>

        {store.address?.full && (
          <Text style={styles.section}>{store.address.full}</Text>
        )}

        {store.distance != null && (
          <Text style={styles.distance}>
            A {(store.distance / 1000).toFixed(2)} km
          </Text>
        )}

        {store.website && (
          <Pressable onPress={() => Linking.openURL(store.website)}>
            <Text style={styles.link}>{store.website}</Text>
          </Pressable>
        )}

        <Pressable style={styles.mapButton} onPress={openMaps}>
          <Text style={styles.mapButtonText}>🗺️ Abrir en mapas</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },

  content: {
    padding: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  type: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },

  section: {
    fontSize: 15,
    marginBottom: 12,
  },

  distance: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
  },

  link: {
    fontSize: 14,
    color: "#2e7dff",
    marginBottom: 20,
  },

  mapButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  mapButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  error: {
    padding: 20,
    color: "#777",
    textAlign: "center",
  },
});
