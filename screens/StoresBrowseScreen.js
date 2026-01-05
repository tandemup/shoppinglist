import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import { useLocation } from "../context/LocationContext";

import StoreRow from "../components/StoreRow";
import SearchBar from "../components/SearchBar";

import { ROUTES } from "../navigation/ROUTES";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function StoresBrowseScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { selectForListId, mode } = route.params || {};
  const isSelectMode = mode === "select";

  const { stores } = useStores();
  const { location } = useLocation();

  const [query, setQuery] = useState("");

  /* -------------------------------------------------
     Enriquecer tiendas con distancia + ordenar
  -------------------------------------------------- */
  const orderedStores = useMemo(() => {
    return [...stores]
      .map((store) => {
        if (location && store.location?.latitude && store.location?.longitude) {
          const distanceKm = getDistanceKm(
            location.latitude,
            location.longitude,
            store.location.latitude,
            store.location.longitude
          );

          return { ...store, distanceKm };
        }

        return store;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [stores, location]);

  /* -------------------------------------------------
     Filtrar por búsqueda
  -------------------------------------------------- */
  const filteredStores = useMemo(() => {
    if (!query.trim()) return orderedStores;

    const q = query.toLowerCase();
    return orderedStores.filter((store) =>
      (store.name || "").toLowerCase().includes(q)
    );
  }, [orderedStores, query]);

  /* -------------------------------------------------
     Selección / navegación
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

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  const renderItem = ({ item }) => (
    <StoreRow store={item} onPress={() => handlePressStore(item)} />
  );

  return (
    <FlatList
      data={filteredStores}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Buscar tienda…"
          style={styles.search}
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No se encontraron tiendas</Text>
          <Text style={styles.emptySubtitle}>Prueba con otro nombre</Text>
        </View>
      }
    />
  );
}

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  content: {
    padding: 12,
    paddingBottom: 24,
  },

  search: {
    marginBottom: 12,
  },

  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
