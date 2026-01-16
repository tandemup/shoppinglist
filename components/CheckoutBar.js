import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatCurrency } from "../utils/store/prices";
import { DEFAULT_CURRENCY } from "../constants/currency";

export default function CheckoutBar({ total, currency, onCheckout }) {
  if (!total || total <= 0) return null;

  const summaryCurrency = currency ?? DEFAULT_CURRENCY.code;

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(total, summaryCurrency)}
        </Text>
      </View>

      <Pressable style={styles.button} onPress={onCheckout}>
        <Ionicons name="cart" size={18} color="#fff" />
        <Text style={styles.buttonText}>Finalizar compra</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 22,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },

  button: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 20,
  },
});
