/*
        onPress1={() =>
          navigation.navigate(ROUTES.STORES_TAB, {
            screen: ROUTES.STORES_BROWSE,
            params: {
              selectForListId: listId,
            },
          })
        }
*/

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useStore } from "../context/StoreContext";
import { ROUTES } from "../navigation/ROUTES";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params ?? {};
  const { lists, setStoreForList } = useStore();

  const list = lists.find((l) => l.id === listId);

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.subtitle}>Lista no encontrada</Text>
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
        <Text style={styles.storeLabel}>Tienda</Text>
        <Text style={styles.storeValue}>
          {list.storeId ? "Cambiar tienda" : "Seleccionar tienda"}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
