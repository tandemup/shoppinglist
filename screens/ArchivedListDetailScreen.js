// ArchivedListDetailScreen.js — Versión C (bloques suaves estilo dashboard)

import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import BarcodeLink from "../components/BarcodeLink";

export default function ArchivedListDetailScreen({ route }) {
  const { list } = route.params;

  const date = dayjs(list.createdAt).format("D MMMM YYYY");

  const total = list.items.reduce(
    (acc, i) => acc + (i.priceInfo?.total ?? 0),
    0
  );

  const renderItem = ({ item }) => {
    const qty = item.priceInfo?.qty ?? 1;
    const unit = item.priceInfo?.unitType ?? "u";
    const unitPrice = item.priceInfo?.unitPrice ?? null;
    const summary = item.priceInfo?.summary;
    const hasPromo = item.priceInfo?.promo !== "none";

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          {/* Nombre */}
          <Text style={styles.name}>{item.name}</Text>

          {/* Info compacta */}
          <View style={styles.inline}>
            <Ionicons name="cart-outline" size={14} color="#6B7280" />
            <Text style={styles.qty}>
              {qty} {unit}
            </Text>
          </View>

          {/* Precio unitario */}
          {unitPrice !== null && (
            <Text style={styles.unitPrice}>
              {unitPrice.toFixed(2)} € / {unit}
            </Text>
          )}

          {/* Promoción */}
          {hasPromo && summary && <Text style={styles.promo}>{summary}</Text>}

          {/* Barcode */}
          {item.barcode && (
            <View style={{ marginTop: 4 }}>
              <BarcodeLink
                barcode={item.barcode}
                label="Código:"
                styleType="subtle"
              />
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.totalBox}>
          <Text style={styles.totalText}>
            {(item.priceInfo?.total ?? 0).toFixed(2)} €
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* CABECERA */}
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

      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={list.items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

//
// ESTILOS — VERSIÓN C (dashboard suave con bloques grises)
//
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },

  //
  // CABECERA BLOQUE
  //
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

  //
  // CARDS DE PRODUCTOS
  //
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
