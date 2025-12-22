import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ItemDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalle de producto</Text>
      <Text style={styles.subtitle}>
        Pantalla temporal mientras se reconstruye el módulo de productos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
