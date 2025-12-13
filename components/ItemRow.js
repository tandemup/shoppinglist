import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PriceFormatter } from "../utils/pricing/PricingEngine";

export default function ItemRow({ item, onToggle, onPressDetail }) {
  // 🔒 Fuente única de verdad
  const info = item.priceInfo ?? {};

  const qty = Number(info.qty ?? 1);
  const unitPrice = Number(info.unitPrice ?? 0);
  const unit = info.unit ?? "u";
  const promo = info.promo ?? "none";
  const currency = info.currency ?? "€";

  // Texto descriptivo (solo formateo, no lógica)
  const fmt = PriceFormatter.formatLineDetailed({
    qty,
    unitPrice,
    promo,
    unit,
    currency,
    lang: "es",
  });

  const isActive = item.checked === true;

  // ✅ CONDICIÓN CORRECTA DE OFERTA
  const hasOffer =
    info.promo && info.promo !== "none" && Number(info.savings) > 0;

  const handleToggle = () => {
    onToggle(item.id);
  };

  return (
    <View style={[styles.item, !isActive && styles.itemInactive]}>
      {/* CHECKBOX */}
      <Pressable
        onPress={handleToggle}
        style={[styles.checkbox, isActive && styles.checkboxChecked]}
      >
        {isActive && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>

      {/* COLUMNA IZQUIERDA */}
      <View style={styles.left}>
        {/* Nombre */}
        <Text
          style={[styles.name, !isActive && styles.nameOff]}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* 🏷 OFERTA + AHORRO */}
        {hasOffer && (
          <View style={[styles.offerCard, !isActive && styles.offerCardOff]}>
            <Ionicons
              name="pricetag"
              size={14}
              color={isActive ? "#16a34a" : "#94a3b8"}
            />

            <Text style={[styles.offerText, !isActive && styles.offerTextOff]}>
              {info.promoLabel}
            </Text>

            <Text
              style={[styles.offerSeparator, !isActive && styles.offerTextOff]}
            >
              ·
            </Text>

            <Text style={[styles.offerText, !isActive && styles.offerTextOff]}>
              Ahorras {info.savings.toFixed(2)} {currency}
            </Text>
          </View>
        )}

        {/* Línea cantidad × precio unitario */}
        <Text style={[styles.detail, !isActive && styles.detailOff]}>
          {fmt.line}
        </Text>

        {/* Subtotal solo si hay oferta */}
        {hasOffer && (
          <Text style={[styles.subtotal, !isActive && styles.subtotalOff]}>
            Subtotal: {info.subtotal.toFixed(2)} {currency}
          </Text>
        )}
      </View>

      {/* COLUMNA DERECHA */}
      <View style={styles.right}>
        {/* Total */}
        <Text style={[styles.total, !isActive && styles.totalOff]}>
          {info.total.toFixed(2)} {currency}
        </Text>

        {/* Chevron solo si está activo */}
        {isActive && (
          <Pressable onPress={onPressDetail}>
            <Ionicons name="chevron-forward" size={22} color="#555" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 4,
  },

  itemInactive: {
    backgroundColor: "#f3f3f3",
    borderColor: "#ccc",
    opacity: 0.9,
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
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },

  checkMark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  left: {
    flex: 1,
    marginRight: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  nameOff: {
    color: "#aaa",
  },

  detail: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },

  detailOff: {
    color: "#bbb",
  },

  subtotal: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  subtotalOff: {
    color: "#bbb",
  },

  offerCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    gap: 4,
  },

  offerCardOff: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },

  offerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a",
  },

  offerSeparator: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },

  offerTextOff: {
    color: "#94a3b8",
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },

  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  totalOff: {
    color: "#aaa",
  },
});
