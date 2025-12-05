import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ItemRow({ item, onToggle, onEdit }) {
  const unit_logo = { u: "🧩", kg: "⚖️", l: "🧃" };

  const qty = item?.priceInfo?.qty ?? 1;
  const unit = item?.priceInfo?.unit ?? "u";
  const unitPrice = item?.priceInfo?.unitPrice ?? 0;
  const total = item?.priceInfo?.total ?? qty * unitPrice;

  const promo = item?.priceInfo?.promo;
  const summary = item?.priceInfo?.summary;
  console.log("promo", promo);
  // Mostrar icono y summary solo si la promo es distinta de "none"
  const hasPromo = promo && promo !== "none";
  const iconUnidad = unit_logo[unit] || "🧩";

  return (
    <View style={styles.item}>
      {/* CHECKBOX -> único lugar donde se lanza toggle */}
      <Pressable
        onPress={() => onToggle(item.id)}
        style={[styles.checkbox, item.checked && styles.checkboxChecked]}
        hitSlop={14}
      >
        {item.checked && <Text style={styles.checkboxMark}>✓</Text>}
      </Pressable>

      {/* CONTENIDO CENTRAL — sin Pressable */}
      <View style={styles.leftBlock}>
        {/* NOMBRE + ICONO PROMO */}
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              !item.checked &&
                total > 0 && {
                  textDecorationLine: "line-through",
                  color: "#aaa",
                },
            ]}
          >
            {item.name}
          </Text>

          {hasPromo && (
            <Text style={styles.summaryText}>
              <Ionicons
                name="pricetag"
                size={16}
                color="#16a34a"
                style={{ marginLeft: 6 }}
              />
              {promo}
            </Text>
          )}
        </View>

        {/* CANTIDAD + ICONO + PRECIO UNITARIO */}
        <Text style={styles.detailText}>
          {qty}
          {unit} × {unitPrice.toFixed(2)} €/{unit}
        </Text>
      </View>

      {/* PRECIO TOTAL — sin Pressable */}
      <View style={styles.rightBlock}>
        <Text style={styles.priceText}>{total.toFixed(2)} €</Text>
      </View>

      {/* CHEVRON — único lugar donde se abre ItemDetail */}
      <Pressable onPress={() => onEdit(item)} hitSlop={10}>
        <Ionicons name="chevron-forward" size={22} color="#555" />
      </Pressable>
    </View>
  );
}

//
// ESTILOS
//
const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 4,
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

  leftBlock: {
    flex: 1,
    marginRight: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
    marginBottom: 2,
  },

  detailText: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  summaryText: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 2,
    fontWeight: "500",
  },

  rightBlock: {
    minWidth: 80,
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 6,
  },

  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
});
