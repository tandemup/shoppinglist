import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ROUTES } from "../../navigation/ROUTES";
import { useStores } from "../../context/StoresContext";

export default function StoreInfoScreen() {
  const route = useRoute();
  const { storeId } = route.params || {};

  const { getStoreById } = useStores();
  const store = getStoreById(storeId);
  const navigation = useNavigation();

  const handleExploreStores = () => {
    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_HOME,
      params: {
        mode: "browse",
      },
    });
  };
  if (!store) {
    return (
      <View style={styles.emptyContainer}>
        <Text>Tienda no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{store.name}</Text>

      {store.address && <Text style={styles.address}>{store.address}</Text>}

      {store.city && <Text style={styles.meta}>{store.city}</Text>}

      {store.zipcode && <Text style={styles.meta}>{store.zipcode}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },

  exploreButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  exploreText: {
    color: "#fff",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  address: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#666",
  },
});
