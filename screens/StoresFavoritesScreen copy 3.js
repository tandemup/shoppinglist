import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useStores } from "../context/StoresContext";
import StoreRow from "../components/StoreRow";

export default function FavoriteStoresScreen() {
  const { favoriteStores } = useStores();

  if (!favoriteStores || favoriteStores.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
        <Text style={styles.emptyText}>
          Marca una tienda con la estrella para acceder rápidamente a ella
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoreRow
          store={item}
          onPress={() =>
            navigation?.navigate("StoreDetail", { storeId: item.id })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
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
