import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import StoreRow from "../components/StoreRow";
import PrimaryButton from "../components/PrimaryButton"; // ajusta si usas otro
import { ROUTES } from "../navigation/ROUTES";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function StoresFavoritesScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { mode, selectForListId } = route.params || {};
  const isSelectMode = mode === "select";

  const { stores } = useStores();

  /* -------------------------------------------------
     Favoritas
  -------------------------------------------------- */
  const favoriteStores = useMemo(
    () => stores.filter((s) => s.favorite),
    [stores]
  );

  /* -------------------------------------------------
     Header (modo selección)
  -------------------------------------------------- */
  useEffect(() => {
    if (isSelectMode) {
      navigation.setOptions({
        title: "Seleccionar tienda",
      });
    }
  }, [isSelectMode, navigation]);

  /* -------------------------------------------------
     Handlers
  -------------------------------------------------- */
  const handlePressStore = (store) => {
    if (isSelectMode && selectForListId) {
      navigation.navigate(ROUTES.SHOPPING_TAB, {
        screen: ROUTES.SHOPPING_LIST,
        params: {
          listId: selectForListId,
          selectedStore: store,
        },
      });
      return;
    }

    navigation.navigate(ROUTES.STORE_DETAIL, {
      storeId: store.id,
    });
  };

  const handleExploreStores = () => {
    navigation.navigate(ROUTES.STORES_BROWSE, {
      mode: "select",
      selectForListId,
    });
  };

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  const renderItem = ({ item }) => (
    <StoreRow
      store={item}
      onPress={() => handlePressStore(item)}
      selectable={isSelectMode}
    />
  );

  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
          <Text style={styles.emptySubtitle}>
            Marca una tienda como favorita para acceder rápidamente desde tus
            listas
          </Text>

          {isSelectMode && (
            <PrimaryButton
              title="Explorar tiendas"
              onPress={handleExploreStores}
              style={styles.exploreButton}
            />
          )}
        </View>
      }
    />
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  content: {
    padding: 12,
    paddingBottom: 24,
  },

  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },

  exploreButton: {
    marginTop: 8,
  },
});
