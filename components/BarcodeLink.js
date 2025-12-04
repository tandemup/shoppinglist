// components/BarcodeLink.js
import React from "react";
import { Text, StyleSheet, View } from "react-native";
import * as Linking from "expo-linking";
import { useStore } from "../context/StoreContext";

export default function BarcodeLink({ barcode, label }) {
  const { config } = useStore();

  if (!barcode) return null;

  // Construir URL según config global
  const buildSearchURL = () => {
    const code = encodeURIComponent(barcode);

    switch (config?.searchEngine) {
      case "amazon":
        return `https://www.amazon.es/s?k=${code}`;

      case "idealo":
        return `https://www.idealo.es/search?q=${code}`;

      case "carrefour":
        return `https://www.carrefour.es/?q=${code}`;

      case "barcodeLookup":
        return `https://www.barcodelookup.com/${code}`;

      case "google":
      default:
        return `https://www.google.com/search?q=${code}`;
    }
  };

  const openBrowser = () => {
    Linking.openURL(buildSearchURL());
  };

  return (
    <View style={styles.container}>
      {/*
      {label && (label !== "") & <Text style={styles.labelText}>{label}</Text>}
 */}
      <Text style={styles.linkText} onPress={openBrowser}>
        {barcode}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  labelText: { fontSize: 12, color: "#555", marginBottom: 2 },
  linkText1: {
    fontSize: 15,
    color: "#1E40AF",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  linkText: {
    fontSize: 12,
    color: "#3b82f6",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
