import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function ItemRow({ item, onToggle, onEdit }) {
  const price = Number(item.price) || 0;
  const qty = Number(item.qty) || 1;
  const total = price * qty;

  return (
    <Pressable onPress={() => onEdit(item)} style={styles.row}>
      <Pressable onPress={() => onToggle(item.id)} style={styles.check}>
        <Text>{item.checked ? "☑️" : "⬜️"}</Text>
      </Pressable>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.meta}>
          {qty} × {price.toFixed(2)} € ={" "}
          <Text style={styles.total}>{total.toFixed(2)} €</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  check: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
    color: "#666",
  },
  total: {
    fontWeight: "600",
  },
});
