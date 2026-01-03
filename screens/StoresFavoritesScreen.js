import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import { useStore } from "../context/StoreContext";
import { ROUTES } from "../navigation/ROUTES";

export default function StoresFavoritesScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectForListId } = route.params ?? {};

  const { stores, favorites, loading } = useStores();
  const { setStoreForList } = useStore();

  // 🧠 DERIVACIÓN CORRECTA (NUNCA undefined)
  const favoriteStores = useMemo(() => {
    if (!Array.isArray(stores) || !Array.isArray(favorites)) return [];
    return stores.filter((s) => favorites.includes(s.id));
  }, [stores, favorites]);

  // 🔁 REDIRECCIÓN AUTOMÁTICA
  useEffect(() => {
    if (!loading && selectForListId && favoriteStores.length === 0) {
      navigation.replace(ROUTES.STORES_BROWSE, {
        selectForListId,
      });
    }
  }, [loading, selectForListId, favoriteStores, navigation]);

  // ────────────────────────────────────────────────
  // SELECCIONAR TIENDA
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // RENDER ITEM
  // ────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <Pressable style={styles.storeRow} onPress={() => handleSelectStore(item)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.storeName}>{item.name}</Text>
        {!!item.address && (
          <Text style={styles.storeAddress}>{item.address}</Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  // ────────────────────────────────────────────────
  // EMPTY STATE (solo modo normal)
  // ────────────────────────────────────────────────
  if (!loading && favoriteStores.length === 0 && !selectForListId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
        <Text style={styles.emptySubtitle}>
          Marca ⭐ una tienda para que aparezca aquí
        </Text>

        <Pressable
          style={styles.browseBtn}
          onPress={() => navigation.navigate(ROUTES.STORES_BROWSE)}
        >
          <Text style={styles.browseText}>Buscar tiendas</Text>
        </Pressable>
      </View>
    );
  }

  // ────────────────────────────────────────────────
  // LISTADO
  // ────────────────────────────────────────────────
  return (
    <FlatList
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
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
  storeAddress: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: "#999",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
  browseBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseText: {
    color: "#fff",
    fontWeight: "600",
  },
});
