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

  // 💰 Mostrar precio total con tolerancia a valores 0 o undefined
  const totalPrice = (() => {
    if (item.priceInfo && typeof item.priceInfo.total === "number") {
      return item.priceInfo.total.toFixed(2);
    }
    if (item.priceInfo && item.priceInfo.total) {
      return parseFloat(item.priceInfo.total).toFixed(2);
    }
    if (item.price) {
      return parseFloat(item.price).toFixed(2);
    }
    return "0.00";
  })();

  return (
    <View
      style={[
        styles.item,
        !item.checked && { backgroundColor: "#f8f8f8", opacity: 0.9 },
      ]}
    >
      {/* ☑️ Checkbox */}
      <Pressable
        onPress={handleToggle}
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {item.checked && <Text style={styles.checkboxMark}>✓</Text>}
      </Pressable>

      {/* 🧾 Nombre del producto */}
      <View style={styles.nameContainer}>
        <Text
          style={[
            styles.name,
            !item.checked && {
              textDecorationLine: "line-through",
              color: "#aaa",
            },
          ]}
          numberOfLines={1}
        >
          {item.name || "Sin nombre"}
        </Text>
      </View>

      {/* 💰 Precio y detalles */}
      <TouchableOpacity
        style={styles.priceContainer}
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        {/* Precio total */}
        <Text style={styles.priceText}>{totalPrice} €</Text>

        {/* 🧮 Mostrar (n × precio unitario) solo si hay más de una unidad */}
        {CONFIG.SHOW_MULTIUNIT_DETAIL &&
          item.priceInfo?.qty > 1 &&
          item.priceInfo?.unitPrice && (
            <Text style={styles.multiUnitText}>
              ({item.priceInfo.qty} × {item.priceInfo.unitPrice.toFixed(2)} €/
              {item.priceInfo.unitType === "kg"
                ? "kg"
                : item.priceInfo.unitType === "l"
                ? "l"
                : "u"}
              )
            </Text>
          )}

        {/* Tipo de promoción */}
        {CONFIG.SHOW_PROMO_TYPE && item.priceInfo?.promo !== "none" && (
          <Text style={styles.promoText}>{item.priceInfo.promo}</Text>
        )}

        {/* Fórmula de promoción */}
        {CONFIG.SHOW_PROMO_FORMULA && item.priceInfo?.summary && (
          <Text style={styles.summaryText} numberOfLines={1}>
            {item.priceInfo.summary}
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
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  priceContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 80,
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
    textAlign: "right",
  },
  promoText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  summaryText: {
    fontSize: 10,
    color: "#999",
    textAlign: "right",
    marginTop: 2,
  },
});
