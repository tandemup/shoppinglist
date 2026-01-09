// PurchaseHistoryScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";
import { ROUTES } from "../navigation/ROUTES";
import { formatCurrency } from "../utils/store/formatters";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function PurchaseHistoryScreen() {
  const navigation = useNavigation();
  const { purchaseHistory } = useLists();
  const { getStoreById } = useStores();

  const [search, setSearch] = useState("");

  /* ---------------------------
     Agrupar por producto
  ----------------------------*/
  const grouped = useMemo(() => {
    const map = {};

    purchaseHistory.forEach((p) => {
      const key = p.name.toLowerCase();

      if (!map[key]) {
        map[key] = {
          name: p.name,
          purchases: [],
        };
      }

      map[key].purchases.push(p);
    });

    return Object.values(map);
  }, [purchaseHistory]);

  /* ---------------------------
     Filtro
  ----------------------------*/
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return grouped;

    return grouped.filter((g) => g.name.toLowerCase().includes(q));
  }, [grouped, search]);

  /* ---------------------------
     Render item
  ----------------------------*/
  const renderItem = ({ item }) => {
    if (!item?.purchases || item.purchases.length === 0) {
      return null;
    }

    const sorted = [...item.purchases].sort(
      (a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt)
    );

    const last = sorted[0];
    if (!last) return null;

    const store = last.storeId ? getStoreById(last.storeId) : null;

    const openSearch = (query) => {
      const url = `https://www.google.com/search?q=${encodeURIComponent(
        query
      )}`;
      Linking.openURL(url);
    };

    return (
      <Pressable
        style={styles.card}
        onPress1={() =>
          navigation.navigate(ROUTES.PURCHASE_HISTORY_DETAIL, {
            productName: item.name,
            purchases: item.purchases,
          })
        }
      >
        <View style={{ flex: 1 }}>
          {/* Nombre */}
          <Text style={styles.name}>{item.name}</Text>

          {/* Meta */}
          <Text style={styles.meta}>
            {item.purchases.length} compras ·{" "}
            {last.purchasedAt
              ? new Date(last.purchasedAt).toLocaleDateString()
              : "—"}
          </Text>

          {/* Barcode */}
          {last.barcode && (
            <Pressable onPress={() => openSearch(`EAN ${last.barcode}`)}>
              <Text style={styles.link}>Código: {last.barcode}</Text>
            </Pressable>
          )}

          {/* Tienda */}
          {store?.name && (
            <Pressable onPress={() => openSearch(`${item.name} ${store.name}`)}>
              <Text style={styles.link}>Última tienda: {store.name}</Text>
            </Pressable>
          )}
        </View>

        {/* Precio */}
        <View style={styles.priceBox}>
          <Ionicons name="pricetag-outline" size={18} color="#059669" />
          <Text style={styles.price}>
            {formatCurrency(last.priceInfo?.total ?? 0)}
          </Text>
        </View>
      </Pressable>
    );
  };

  /* ---------------------------
     Render
  ----------------------------*/
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Historial de compras</Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar producto…"
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        keyboardDismissMode="on-drag"
        contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay historial todavía</Text>
        }
      />
    </View>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 12,
  },

  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    marginTop: 2,
    color: "#6B7280",
  },

  store: {
    marginTop: 4,
    fontSize: 13,
    color: "#374151",
  },

  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    textAlign: "center",
    color: "#9CA3AF",
  },
  link: {
    marginTop: 4,
    fontSize: 13,
    color: "#2563EB",
    textDecorationLine: "underline",
  },
});
