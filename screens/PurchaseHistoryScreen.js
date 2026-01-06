import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { usePurchases } from "../context/PurchasesContext";
import { ROUTES } from "../navigation/ROUTES";
import { formatCurrency } from "../utils/store/formatters";

export default function PurchaseHistoryScreen() {
  const navigation = useNavigation();
  const { purchaseHistory = [] } = usePurchases();
  const [search, setSearch] = useState("");

  /* ---------------------------
     Filtro robusto
  ----------------------------*/
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return purchaseHistory;

    return purchaseHistory.filter((p) => {
      const storeName =
        typeof p.store === "string" ? p.store : p.store?.name ?? "";

      const dateText = p.date ? new Date(p.date).toLocaleDateString() : "";

      return (
        storeName.toLowerCase().includes(q) ||
        dateText.toLowerCase().includes(q)
      );
    });
  }, [purchaseHistory, search]);

  const openDetail = (purchase) => {
    navigation.navigate(ROUTES.PURCHASE_DETAIL, { purchase });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Historial de compras</Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar por tienda o fecha"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        keyboardDismissMode="on-drag"
        contentContainerStyle={filtered.length === 0 && styles.emptyContainer}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openDetail(item)}>
            <View>
              <Text style={styles.store}>
                {typeof item.store === "string" ? item.store : item.store?.name}
              </Text>

              <Text style={styles.date}>
                {item.date ? new Date(item.date).toLocaleDateString() : ""}
              </Text>
            </View>

            <NoteTotal items={item.items} />
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay compras registradas</Text>
        }
      />
    </View>
  );
}

function NoteTotal({ items }) {
  const total = (items ?? []).reduce(
    (sum, i) => sum + (i.priceInfo?.total ?? 0),
    0
  );

  return (
    <View style={styles.totalBox}>
      <Ionicons name="receipt-outline" size={18} color="#059669" />
      <Text style={styles.totalText}>{formatCurrency(total)}</Text>
    </View>
  );
}

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
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  store: {
    fontSize: 16,
    fontWeight: "600",
  },

  date: {
    color: "#6B7280",
    marginTop: 2,
  },

  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  totalText: {
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
