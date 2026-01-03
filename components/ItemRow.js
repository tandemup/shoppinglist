import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatUnit } from "../utils/pricing/unitFormat";

export default function ItemRow({ item, onToggle, onEdit }) {
  const isChecked = item.checked === true;
  const price = item.priceInfo;

  if (!price) return null;

  return (
    <View style={[styles.row, !isChecked && styles.rowDiscarded]}>
      {/* CHECKBOX → SOLO TOGGLE */}
      <Pressable
        onPress={() => onToggle(item.id)}
        hitSlop={8}
        style={styles.checkbox}
      >
        <Ionicons
          name={isChecked ? "checkbox" : "square-outline"}
          size={22}
          color={isChecked ? "#16a34a" : "#9ca3af"}
        />
      </Pressable>

      {/* INFO (NO CLICABLE) */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, !isChecked && styles.nameDiscarded]}>
            {item.name}
          </Text>

          {price.promo !== "none" && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{price.promoLabel}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.subText, !isChecked && styles.textDiscarded]}>
          {price.qty} {formatUnit(price.unit)} × {price.unitPrice.toFixed(2)} €
        </Text>

        {price.savings > 0 && (
          <Text style={[styles.savings, !isChecked && styles.textDiscarded]}>
            Ahorro: {price.savings.toFixed(2)} €
          </Text>
        )}
      </View>

      {/* TOTAL */}
      <Text style={[styles.total, !isChecked && styles.textDiscarded]}>
        {price.total.toFixed(2)} €
      </Text>

      {/* CHEVRON → ABRIR EDITOR */}
      <Pressable onPress={() => onEdit(item)} hitSlop={10}>
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },

  rowDiscarded: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
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
    gap: 6,
    flexWrap: "wrap",
  },

  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },

  nameDiscarded: {
    color: "#6b7280",
  },

  subText: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },

  savings: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "600",
    marginTop: 2,
  },

  total: {
    fontSize: 15,
    fontWeight: "700",
    marginRight: 6,
    color: "#111827",
  },

  textDiscarded: {
    color: "#9ca3af",
  },

  /* 🟨 OFERTA */
  offerBadge: {
    backgroundColor: "#fde047",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  offerText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },
});
