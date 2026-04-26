import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import BarcodeScannerView from "./BarcodeScannerView";

export default function ScannerScreen({ navigation, route }) {
  const [mode, setMode] = useState("detail");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <BarcodeScannerView
          mode={mode}
          onDetected={(code) => {
            navigation.navigate("ItemDetail", {
              scannedBarcode: code,
            });
          }}
          onClose={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  selectorWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectorButtonActive: {
    backgroundColor: "#2563eb",
  },
  selectorText: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  selectorTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
});
