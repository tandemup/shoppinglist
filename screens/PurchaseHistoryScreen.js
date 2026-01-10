import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";

import { joinText, priceText, metaText } from "../utils/store/formatters";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function PurchaseHistoryScreen() {
  const navigation = useNavigation();
  const { purchaseHistory } = useLists();
  const { getStoreById } = useStores();

  const [search, setSearch] = useState("");

  /* ---------------------------
     Filtro simple
  ----------------------------*/
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return purchaseHistory;

    return purchaseHistory.filter((p) => p.name?.toLowerCase().includes(q));
  }, [purchaseHistory, search]);

  /* ---------------------------
     Helpers
  ----------------------------*/
  const openSearch = (query) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  /* ---------------------------
     Render item
  ----------------------------*/
  const renderItem = ({ item }) => {
    const store = item.storeId ? getStoreById(item.storeId) : null;

    return (
      <View style={styles.card}>
        {/* INFO IZQUIERDA */}
        <View style={{ flex: 1 }}>
          {/* Nombre */}
          <Text style={styles.name}>{item.name}</Text>

          {/* Meta */}
          <Text style={styles.meta}>
            {metaText(item.frequency, item.lastPurchasedAt)}
          </Text>

          {/* Código de barras */}
          {item.barcode ? (
            <Pressable onPress={() => openSearch(`EAN ${item.barcode}`)}>
              <Text style={styles.link}>
                {joinText("Código: ", item.barcode)}
              </Text>
            </Pressable>
          ) : null}

          {/* Última tienda */}
          {store?.name ? (
            <Pressable onPress={() => openSearch(`${item.name} ${store.name}`)}>
              <Text style={styles.link}>
                {joinText("Última tienda: ", store.name)}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* PRECIO */}
        <View style={styles.priceBox}>
          <Ionicons name="pricetag-outline" size={18} color="#059669" />
          <Text style={styles.price}>
            {priceText(item.lastPrice, item.unit)}
          </Text>
        </View>
      </View>
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
        keyExtractor={(item) => item.id}
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
    fontSize: 13,
  },

  link: {
    marginTop: 4,
    fontSize: 13,
    color: "#2563EB",
    textDecorationLine: "underline",
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
});
