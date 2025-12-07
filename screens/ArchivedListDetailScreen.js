import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../context/StoreContext";

import dayjs from "dayjs";
import BarcodeLink from "../components/BarcodeLink";

// ============================================================
// COMPONENTE: ENCABEZADO
// ============================================================
function HeaderCard({ list, date, total, styles }) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.title}>{list.title}</Text>

      <View style={styles.inline}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text style={styles.meta}>{date}</Text>

        {list.store && (
          <View style={styles.inline}>
            <Text style={styles.dot}>•</Text>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.meta}>{list.store}</Text>
          </View>
        )}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
      </View>
    </View>
  );
}

// ============================================================
// COMPONENTE: ITEM DE LISTA
// ============================================================
function ItemName({ name, styles }) {
  return <Text style={styles.name}>{name}</Text>;
}

function ItemQty({ qty, unit, styles }) {
  return (
    <View style={styles.inline}>
      <Ionicons name="cart-outline" size={14} color="#6B7280" />
      <Text style={styles.qty}>
        {qty} {unit}
      </Text>
    </View>
  );
}

function ItemUnitPrice({ unitPrice, unit, styles }) {
  if (unitPrice == null) return null;

  return (
    <Text style={styles.unitPrice}>
      {unitPrice.toFixed(2)} € / {unit}
    </Text>
  );
}

function ItemPromo({ summary, hasPromo, styles }) {
  if (!hasPromo || !summary) return null;

  return <Text style={styles.promo}>{summary}</Text>;
}

function ItemBarcode({ barcode }) {
  if (!barcode) return null;

  return (
    <View style={{ marginTop: 4 }}>
      <BarcodeLink
        barcode={barcode}
        label={<Text style={{ color: "#6B7280" }}>Código:</Text>}
        styleType="subtle"
      />
    </View>
  );
}

function ItemTotal({ total, styles }) {
  return (
    <View style={styles.totalBox}>
      <Text style={styles.totalText}>{total.toFixed(2)} €</Text>
    </View>
  );
}

function ItemCard({ item, styles }) {
  const qty = item.priceInfo?.qty ?? 1;
  const unit = item.priceInfo?.unitType ?? "u";
  const unitPrice = item.priceInfo?.unitPrice ?? null;
  const summary = item.priceInfo?.summary;
  const hasPromo = item.priceInfo?.promo !== "none";
  const total = item.priceInfo?.total ?? 0;

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <ItemName name={item.name} styles={styles} />

        <ItemQty qty={qty} unit={unit} styles={styles} />

        <ItemUnitPrice unitPrice={unitPrice} unit={unit} styles={styles} />

        <ItemPromo summary={summary} hasPromo={hasPromo} styles={styles} />

        <ItemBarcode barcode={item.barcode} />
      </View>

      <ItemTotal total={total} styles={styles} />
    </View>
  );
}

// ============================================================
// PANTALLA PRINCIPAL
// ============================================================

export default function ArchivedListDetailScreen({ route, navigation }) {
  const { list } = route.params;
  const date = dayjs(list.createdAt).format("D MMMM YYYY");
  const total = list.items.reduce(
    (acc, i) => acc + (i.priceInfo?.total ?? 0),
    0
  );
  const { reload } = useStore();

  useEffect(() => {
    reload();

    const unsub = navigation.addListener("focus", reload);
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <HeaderCard list={list} date={date} total={total} styles={styles} />

      <FlatList
        data={list.items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ItemCard item={item} styles={styles} />}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },

  // HEADER
  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  inline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  meta: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6B7280",
  },

  dot: {
    marginHorizontal: 8,
    color: "#6B7280",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#059669",
  },

  // ITEM
  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    flexDirection: "row",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  qty: {
    marginLeft: 4,
    fontSize: 14,
    color: "#4B5563",
  },

  unitPrice: {
    marginLeft: 18,
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  promo: {
    marginLeft: 18,
    marginTop: 4,
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "600",
  },

  totalBox: {
    justifyContent: "center",
    alignItems: "flex-end",
    width: 90,
  },

  totalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
  },
});
