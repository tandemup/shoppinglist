import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

import { useLists } from "../context/ListsContext";
import BarcodeLink from "../components/BarcodeLink";
import {
  qtyText,
  unitPriceText,
  headerMetaText,
  totalText,
} from "../utils/ui/formatText";
import { joinText } from "../utils/ui/text";
// ============================================================
// COMPONENTE: ENCABEZADO
// ============================================================
function HeaderCard({ list, date, total, styles }) {
  const meta = headerMetaText(date, list.store);

  return (
    <View style={styles.headerCard}>
      <Text style={styles.title}>{list.name}</Text>

      <View style={styles.inline}>
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text style={styles.meta}>{meta}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{totalText(total)}</Text>
      </View>
    </View>
  );
}

// ============================================================
// COMPONENTE: ITEM
// ============================================================
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
        <Text style={styles.name}>{item.name}</Text>

        <View style={styles.inline}>
          <Ionicons name="cart-outline" size={14} color="#6B7280" />
          <Text style={styles.qty}>{qtyText(qty, unit)}</Text>
        </View>

        {unitPrice != null ? (
          <Text style={styles.unitPrice}>{unitPriceText(unitPrice, unit)}</Text>
        ) : null}

        {hasPromo && summary ? (
          <Text style={styles.promo}>{summary}</Text>
        ) : null}

        {item.barcode ? (
          <View style={{ marginTop: 4 }}>
            <BarcodeLink
              barcode={item.barcode}
              label={<Text style={{ color: "#6B7280" }}>Código:</Text>}
              styleType="subtle"
            />
          </View>
        ) : null}
      </View>

      <View style={styles.totalBox}>
        <Text style={styles.totalText}>{totalText(total)}</Text>
      </View>
    </View>
  );
}

// ============================================================
// PANTALLA PRINCIPAL
// ============================================================
export default function ArchivedListDetailScreen({ route }) {
  const { listId } = route.params;

  const { archivedLists } = useLists();

  const list = useMemo(
    () => archivedLists.find((l) => l.id === listId),
    [archivedLists, listId]
  );

  if (!list) {
    return (
      <View style={styles.screen}>
        <Text>{joinText("Lista no encontrada")}</Text>
      </View>
    );
  }

  const date = dayjs(list.archivedAt ?? list.createdAt).format("D MMMM YYYY");

  const total = list.items.reduce(
    (acc, i) => acc + (i.priceInfo?.total ?? 0),
    0
  );

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
// ESTILOS (sin cambios)
// ============================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },

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
