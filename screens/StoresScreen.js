import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StoresScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiendas</Text>
      <Text style={styles.subtitle}>
        Pantalla temporal mientras se reconstruye el flujo de tiendas
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
