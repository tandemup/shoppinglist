import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useStores } from "../contexts/StoresContext";

export default function FavoriteStoresScreen() {
  const { favoriteStores } = useStores();

  if (favoriteStores.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
        <Text style={styles.emptyText}>
          Marca una tienda como favorita para acceder rápidamente desde tus
          listas
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.city}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    marginTop: 4,
    color: "#666",
  },
});
