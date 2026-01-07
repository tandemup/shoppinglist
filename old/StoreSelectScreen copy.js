// screens/StoreSelectScreen.js
import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import StoreRow from "../components/StoreRow";
import { ROUTES } from "../navigation/ROUTES";

export default function StoreSelectScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectForListId } = route.params ?? {};
  const { favoriteStores } = useStores();

  const handleSelectStore = (store) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, {
      listId: selectForListId,
      selectedStore: store,
    });
  };

  if (!favoriteStores || favoriteStores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>

        <Text style={styles.emptySubtitle}>
          Marca una tienda como favorita para poder seleccionarla rápidamente
        </Text>

        <Pressable
          style={styles.exploreButton}
          onPress={() =>
            navigation.navigate(ROUTES.STORES_TAB, {
              screen: ROUTES.STORES,
              params: { mode: "select", selectForListId },
            })
          }
        >
          <Text style={styles.exploreText}>Explorar tiendas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <StoreRow store={item} onPress={() => handleSelectStore(item)} />
      )}
    />
  );
}
const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
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
});
