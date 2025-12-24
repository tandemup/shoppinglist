import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStore } from "../context/StoreContext";
import { ROUTES } from "../navigation/ROUTES";

export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId, selectedStore } = route.params ?? {};

  const { lists, setStoreForList } = useStore();
  const list = lists.find((l) => l.id === listId);

  // ────────────────────────────────────────────────
  // Guardar tienda cuando vuelve desde Stores
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedStore && listId) {
      setStoreForList(listId, selectedStore);

      // limpiar params para evitar loops
      navigation.setParams({ selectedStore: undefined });
    }
  }, [selectedStore, listId]);

  if (!list) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Lista no encontrada</Text>
      </SafeAreaView>
    );
  }

  // ────────────────────────────────────────────────
  // Navegar a selección de tienda
  // ────────────────────────────────────────────────
  const handleSelectStore = () => {
    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_BROWSE,
      params: {
        selectForListId: list.id,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>{list.name}</Text>

      {/* TIENDA */}
      <Pressable style={styles.storeBox} onPress={handleSelectStore}>
        <Text style={styles.storeLabel}>Tienda</Text>

        {list.store ? (
          <>
            <Text style={styles.storeName}>{list.store.name}</Text>
            {list.store.address && (
              <Text style={styles.storeAddress}>{list.store.address}</Text>
            )}
          </>
        ) : (
          <Text style={styles.storePlaceholder}>Seleccionar tienda</Text>
        )}
      </Pressable>

      {/* AQUÍ IRÁN LOS ITEMS */}
      <View style={styles.itemsPlaceholder}>
        <Text style={{ color: "#888" }}>(Aquí irán los productos)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },

  storeBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 24,
  },

  storeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  storePlaceholder: {
    fontSize: 16,
    color: "#999",
  },

  storeName: {
    fontSize: 16,
    fontWeight: "600",
  },

  storeAddress: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  itemsPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
