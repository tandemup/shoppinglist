import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";

import { useStore } from "../context/StoreContext";
import { ROUTES } from "../navigation/ROUTES";

export default function ShoppingListScreen({ navigation }) {
  const route = useRoute();
  const selectForListId = route.params?.selectForListId;

  const { listId, selectedStoreId } = route.params ?? {};
  const { lists, setStoreForList } = useStore();

  const list = lists.find((l) => l.id === listId);

  // ────────────────────────────────────────────────
  // GUARDAR TIENDA SELECCIONADA (si viene de Stores)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (listId && selectedStoreId) {
      setStoreForList(listId, selectedStoreId);

      // limpiar params para evitar re-ejecución
      navigation.setParams({ selectedStoreId: undefined });
    }
  }, [listId, selectedStoreId]);

  if (!list) {
    return (
      <SafeAreaView>
        <Text>Lista no encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{list.name}</Text>

      <Pressable
        style={styles.storeBox}
        onPress={() =>
          navigation.navigate(ROUTES.STORES_TAB, {
            screen: ROUTES.STORES_BROWSE,
            params: {
              selectForListId: listId,
            },
          })
        }
      >
        <Text>{list.storeId ? `Tienda asignada` : "Seleccionar tienda"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  storeBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

const styles1 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  storeBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 16,
  },
  storeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  storeValue: {
    fontSize: 16,
    fontWeight: "500",
  },
});
