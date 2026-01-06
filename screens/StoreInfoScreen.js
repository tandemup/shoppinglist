import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StoreInfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Información de tiendas</Text>
      <Text style={styles.text}>
        Aquí podrás consultar información general sobre las tiendas, horarios
        especiales y condiciones.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});
