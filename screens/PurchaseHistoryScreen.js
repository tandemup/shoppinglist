// PurchaseHistoryScreen.js — versión final 100% compatible con Web

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useStore } from "../context/StoreContext";

import BarcodeLink from "../components/BarcodeLink";

export default function PurchaseHistoryScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState("");
  const { fetchLists } = useStore();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const allLists = await fetchLists();

    const archived = allLists.filter((l) => l.archived === true);

    const sorted = archived.sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
    );

    setLists(sorted);
  };

  const filterItems = (text) => {
    const t = text.toLowerCase();
    return lists
      .map((l) => ({
        ...l,
        items: l.items.filter((i) =>
          `${i.name} ${i.store ?? ""} ${i.barcode ?? ""}`
            .toLowerCase()
            .includes(t)
        ),
      }))
      .filter((l) => l.items.length > 0);
  };

  const visible = search.trim() ? filterItems(search) : lists;

  const openDetail = (list) => {
    navigation.navigate("ArchivedListDetailScreen", { list });
  };

  const renderItem = ({ item }) => {
    const date = dayjs(item.createdAt).format("D MMM YYYY");

    const total = item.items.reduce(
      (acc, it) => acc + (it.priceInfo?.total ?? 0),
      0
    );

    return (
      <Pressable style={styles.card} onPress={() => openDetail(item)}>
        {/* Fecha (sin chevron) */}
        <View style={styles.rowTop}>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        {/* Productos */}
        {item.items.slice(0, 3).map((prod, idx) => {
          const qty = prod.priceInfo?.qty ?? 1;
          const unit = prod.priceInfo?.unitType ?? "u";
          const unitPrice = prod.priceInfo?.unitPrice ?? null;
          const summary = prod.priceInfo?.summary;
          const hasPromo =
            prod.priceInfo?.promo && prod.priceInfo.promo !== "none";

          return (
            <View key={idx} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{prod.name}</Text>

                <View style={styles.rowInline}>
                  <Ionicons name="cart-outline" size={14} color="#6B7280" />
                  <Text style={styles.qtyText}>
                    {qty} {unit}
                  </Text>
                </View>

                {unitPrice !== null && (
                  <Text style={styles.unitText}>
                    {unitPrice.toFixed(2)} € / {unit}
                  </Text>
                )}

                {hasPromo && summary && (
                  <Text style={styles.offerText}>{summary}</Text>
                )}

                {prod.barcode && (
                  <View style={{ marginTop: 2 }}>
                    <BarcodeLink
                      barcode={prod.barcode}
                      label="Código:"
                      styleType="subtle"
                    />
                  </View>
                )}
              </View>

              <View style={styles.totalBlock}>
                <Text style={styles.totalProdText}>
                  {(prod.priceInfo?.total ?? 0).toFixed(2)} €
                </Text>
              </View>
            </View>
          );
        })}

        {/* Total de la lista */}
        <View style={styles.listTotalRow}>
          <Text style={styles.listTotalLabel}>Total</Text>
          <Text style={styles.listTotalValue}>{total.toFixed(2)} €</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Compras</Text>

      <TextInput
        placeholder="Buscar producto, código, tienda…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchInput: {
    backgroundColor: "#F3F4F6",
    backgroundColor: "#fff",

    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  dateText: { fontSize: 15, color: "#6B7280" },

  itemRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  itemName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },

  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  qtyText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#4B5563",
  },

  unitText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 18,
    marginTop: 1,
  },

  offerText: {
    marginTop: 2,
    marginLeft: 18,
    color: "#16a34a",
    fontSize: 13,
    fontWeight: "500",
  },

  totalBlock: {
    justifyContent: "center",
    alignItems: "flex-end",
    width: 80,
  },

  totalProdText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
  },

  listTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  listTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  listTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#059669",
  },
});
