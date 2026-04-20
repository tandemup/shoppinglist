import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function QuickAction({ icon, label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: "#E5E7EB" }}
    >
      <Ionicons name={icon} size={22} color="#2563eb" />
      <Text style={styles.quickText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickCard: {
    width: "48%", // 🔑 clave para grid 2x2 consistente
    backgroundColor: "#fff",
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  quickText: {
    marginTop: 6,
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.7,
  },
});
