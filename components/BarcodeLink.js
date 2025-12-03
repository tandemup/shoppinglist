// components/BarcodeLink.js
import React from "react";
import { Text, StyleSheet, Linking, View } from "react-native";

export default function BarcodeLink({ barcode, label }) {
  if (!barcode) return null;

  // URL de búsqueda (Google por defecto)
  const url = `https://www.google.com/search?q=${encodeURIComponent(barcode)}`;

  const openBrowser = () => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Etiqueta opcional */}
      {label && <Text style={styles.labelText}>{label}</Text>}

      {/* Código azul subrayado */}
      <Text style={styles.linkText} onPress={openBrowser}>
        {barcode}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  labelText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  linkText: {
    fontSize: 15,
    color: "#1E40AF", // azul típico de enlace
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
