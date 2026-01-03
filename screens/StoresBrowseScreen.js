import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import { useStore } from "../context/StoreContext";
import { useLocation } from "../context/LocationContext";

import { ROUTES } from "../navigation/ROUTES";
import { getDistanceKm } from "../utils/math/distance";

export default function StoresBrowseScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectForListId } = route.params ?? {};

  const { stores, favorites, loading, toggleFavorite } = useStores();
  const { setStoreForList } = useStore();
  const { location } = useLocation();

  const data = useMemo(() => (Array.isArray(stores) ? stores : []), [stores]);

  const handleSelectStore = async (store) => {
    if (selectForListId) {
      await setStoreForList(selectForListId, store.id);

      navigation.navigate(ROUTES.SHOPPING_TAB, {
        screen: ROUTES.SHOPPING_LIST,
        params: { listId: selectForListId },
      });
      return;
    }

    navigation.navigate(ROUTES.STORE_DETAIL, {
      storeId: store.id,
    });
  };

  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item.id);

    const distanceKm =
      location && item.location ? getDistanceKm(location, item.location) : null;

    const addressLine = [item.address, item.zipcode, item.city]
      .filter(Boolean)
      .join(", ");

    return (
      <Pressable
        style={styles.storeRow}
        onPress={() => handleSelectStore(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.storeName}>{item.name}</Text>

          {!!addressLine && <Text style={styles.address}>{addressLine}</Text>}

          {distanceKm != null && (
            <Text style={styles.distance}>📍 {distanceKm.toFixed(1)} km</Text>
          )}
        </View>

        <Pressable onPress={() => toggleFavorite(item.id)}>
          <Text style={[styles.star, isFav && styles.starActive]}>★</Text>
        </Pressable>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando tiendas…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {selectForListId && (
        <Pressable
          style={styles.backBtn}
          onPress={() =>
            navigation.navigate(ROUTES.SHOPPING_TAB, {
              screen: ROUTES.SHOPPING_LIST,
              params: { listId: selectForListId },
            })
          }
        >
          <Text style={styles.backText}>← Volver a la lista</Text>
        </Pressable>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  storeRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  address: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 4,
  },
  star: {
    fontSize: 22,
    color: "#ccc",
    paddingHorizontal: 8,
  },
  starActive: {
    color: "#facc15",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
});
