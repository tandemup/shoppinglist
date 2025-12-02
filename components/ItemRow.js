/* ItemRow.js (actualizado con chevron) */
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemRow({ item, onToggle, onEdit }) {
  const handleToggle = () => onToggle(item.id);
  const handleEdit = () => onEdit(item);

  const totalPrice =
    item.priceInfo?.total != null
      ? Number(item.priceInfo.total).toFixed(2)
      : "0.00";

  return (
    <View style={styles.item}>
      {/* ☑️ Checkbox */}
      <Pressable
        onPress={handleToggle}
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
        hitSlop={14}
      >
        {item.checked && <Text style={styles.checkboxMark}>✓</Text>}
      </Pressable>

      {/* Nombre */}
      <View style={styles.nameContainer}>
        <Text
          style={[
            styles.name,
            item.checked === false &&
              item.priceInfo?.total > 0 && {
                textDecorationLine: "line-through",
                color: "#aaa",
              },
          ]}
        >
          {item.name}
        </Text>
      </View>

      {/* Precio */}
      <Pressable
        onPress={handleEdit}
        style={styles.priceContainer}
        hitSlop={14}
      >
        <Text style={styles.priceText}>{totalPrice} €</Text>

        {item.priceInfo?.qty > 1 && item.priceInfo?.unitPrice > 0 && (
          <Text style={styles.multiUnitText}>
            ({item.priceInfo.qty} × {item.priceInfo.unitPrice.toFixed(2)} €)
          </Text>
        )}
      </Pressable>

      {/* ➤ CHEVRON */}
      <Pressable onPress={handleEdit} hitSlop={10}>
        <Ionicons name="chevron-forward" size={22} color="#555" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  checkboxMark: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  nameContainer: { flex: 1 },

  name: { fontSize: 16, color: "#111", fontWeight: "500" },

  priceContainer: {
    minWidth: 80,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  priceText: { fontSize: 15, fontWeight: "600", color: "#111" },
  multiUnitText: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
});
