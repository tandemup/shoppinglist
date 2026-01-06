import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import { useLocation } from "../context/LocationContext";

import StoreRow from "../components/StoreRow";
import { ROUTES } from "../navigation/ROUTES";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function StoresNearbyScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { mode, selectForListId } = route.params || {};
  const isSelectMode = mode === "select";

  const { stores } = useStores();
  const { location } = useLocation();

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
     Calcular distancia y ordenar
  -------------------------------------------------- */
  const nearbyStores = useMemo(() => {
    if (!location) return [];

    return [...stores]
      .map((store) => {
        if (store.location?.latitude && store.location?.longitude) {
          const distanceKm = getDistanceKm(
            location.latitude,
            location.longitude,
            store.location.latitude,
            store.location.longitude
          );

          return { ...store, distanceKm };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [stores, location]);

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
    <StoreRow
      store={item}
      onPress={() => handlePressStore(item)}
      selectable={isSelectMode}
    />
  );

  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>
          Activa la ubicación para ver tiendas cercanas
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={nearbyStores}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.infoText}>
            No se encontraron tiendas cercanas
          </Text>
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
  content: {
    padding: 12,
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  infoText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
});
