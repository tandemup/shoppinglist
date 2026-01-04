import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import StoreRow from "../components/StoreRow";

import { ROUTES } from "../navigation/ROUTES";

export default function StoresFavoritesScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { selectForListId } = route.params || {};

  const { stores, favoriteStoreIds } = useStores();

  /* ---------------------------
     Tiendas favoritas
  ----------------------------*/
  const favoriteStores = useMemo(() => {
    return stores.filter((s) => favoriteStoreIds.includes(s.id));
  }, [stores, favoriteStoreIds]);

  /* ---------------------------
     Handlers
  ----------------------------*/
  const handlePressStore = (store) => {
    // Caso 1: estamos seleccionando tienda para una lista
    if (selectForListId) {
      navigation.navigate(ROUTES.SHOPPING_TAB, {
        screen: ROUTES.SHOPPING_LIST,
        params: {
          listId: selectForListId,
          selectedStore: store,
        },
      });
      return;
    }

    // Caso 2: navegación normal a detalle
    navigation.navigate(ROUTES.STORE_DETAIL, {
      storeId: store.id,
    });
  };

  /* ---------------------------
     Empty state
  ----------------------------*/
  if (favoriteStores.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
        <Text style={styles.emptySubtitle}>
          Marca una tienda con ⭐ para que aparezca aquí
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {favoriteStores.map((store) => (
        <StoreRow
          key={store.id}
          store={store}
          onPress={() => handlePressStore(store)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  content: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
