import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemRow({ item, onToggle, onEdit }) {
  const priceInfo = {
    quantity: Number(item.priceInfo?.quantity) || 1,
    unit: Number(item.priceInfo?.unit) || 0,
    total: Number(item.priceInfo?.total) || 0,
  };

  return (
    <Pressable
      onPress={() => onEdit(item)}
      style={[styles.row, item.checked && styles.rowChecked]}
    >
      {/* CHECKBOX */}
      <Pressable
        onPress={() => onToggle(item.id)}
        style={styles.checkbox}
        hitSlop={8}
      >
        <Ionicons
          name={item.checked ? "checkbox" : "square-outline"}
          size={22}
          color={item.checked ? "#2563eb" : "#999"}
        />
      </Pressable>

      {/* INFO CENTRAL */}
      <View style={styles.content}>
        {/* NOMBRE + OFERTA */}
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          {item.offer?.type && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{item.offer.type}</Text>
            </View>
          )}
        </View>

        {/* SUBTEXTO */}
        {priceInfo && (
          <Text style={styles.subText}>
            {priceInfo.quantity} × {Number(priceInfo.unit).toFixed(2)} €
          </Text>
        )}
      </View>

      {/* PRECIO */}
      {priceInfo && (
        <Text style={styles.total}>{Number(priceInfo.total).toFixed(2)} €</Text>
      )}

      {/* CHEVRON */}
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 8,
  },

  rowChecked: {
    backgroundColor: "#f1f5f9", // fondo tenue
  },

  checkbox: {
    marginRight: 8,
  },

  content: {
    flex: 1,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
  },

  offerBadge: {
    backgroundColor: "#16a34a", // verde oferta
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  offerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  subText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  total: {
    fontSize: 15,
    fontWeight: "600",
    marginRight: 6,
  },
});
