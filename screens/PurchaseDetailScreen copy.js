// PurchaseDetailScreen.js

import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useLists } from "../context/ListsContext";
import { usePurchases } from "../context/PurchasesContext";
import { ROUTES } from "../navigation/ROUTES";
import { formatCurrency } from "../utils/store/formatters";

export default function PurchaseDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { purchase } = route.params;
  const { addPurchase } = usePurchases();

  const { createList, addItem } = useLists();

  /* ---------------------------
     Total
  ----------------------------*/
  const total = useMemo(() => {
    return (purchase.items ?? []).reduce(
      (sum, i) => sum + (i.priceInfo?.total ?? 0),
      0
    );
  }, [purchase.items]);

  /* ---------------------------
     Repetir compra
  ----------------------------*/
  const handleRepeatPurchase = () => {
    const newList = createList(`Recreada • ${purchase.store}`);

    (purchase.items ?? []).forEach((item) => {
      addItem(newList.id, {
        name: item.name,
        priceInfo: item.priceInfo,
        checked: true,
      });
    });

    navigation.replace(ROUTES.SHOPPING_LIST, {
      listId: newList.id,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{purchase.store}</Text>
        <Text style={styles.date}>{purchase.date}</Text>
      </View>

      <FlatList
        data={purchase.items}
        keyExtractor={(item, index) => item.id ?? `item-${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>
              {formatCurrency(item.priceInfo?.total ?? 0)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        }
      />

      <Pressable style={styles.button} onPress={handleRepeatPurchase}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Repetir compra</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  date: {
    color: "#6B7280",
    marginTop: 4,
  },

  row: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 15,
    fontWeight: "500",
  },

  price: {
    fontWeight: "600",
  },

  totalRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#059669",
  },

  button: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
