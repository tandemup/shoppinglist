import React from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { CONFIG } from "../constants/config";

export default function ItemRow({ item, onToggle, onEdit }) {
  const handleToggle = () => onToggle(item.id);
  const handleEdit = () => onEdit(item);

  // 💰 Mostrar precio total con tolerancia
  const totalPrice = (() => {
    if (item.priceInfo?.total != null)
      return Number(item.priceInfo.total).toFixed(2);
    return "0.00";
  })();

  return (
    <View style={styles.item}>
      {/* ☑️ Checkbox */}
      <Pressable
        onPress={handleToggle}
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {item.checked && <Text style={styles.checkboxMark}>✓</Text>}
      </Pressable>

      {/* 🧾 Nombre */}
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

      {/* 💰 Precio */}
      <TouchableOpacity
        style={styles.priceContainer}
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <Text style={styles.priceText}>{totalPrice} €</Text>

        {CONFIG.SHOW_MULTIUNIT_DETAIL &&
          item.priceInfo?.qty > 1 &&
          item.priceInfo?.unitPrice && (
            <Text style={styles.multiUnitText}>
              ({item.priceInfo.qty} × {item.priceInfo.unitPrice.toFixed(2)} €)
            </Text>
          )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  checkbox: {
    width: 26,
    height: 26,
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
    fontSize: 16,
    fontWeight: "bold",
  },

  nameContainer: { flex: 1 },
  name: { fontSize: 16, color: "#111", fontWeight: "500" },

  priceContainer: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  multiUnitText: {
    fontSize: 11,
    color: "#777",
    marginTop: 2,
  },
});
