import React, { useCallback, useRef } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UnifiedBarcodeScanner from "../../components/features/scanner/UnifiedBarcodeScanner";

export default function BarcodeScannerView({ onDetected, onClose }) {
  const handledRef = useRef(false);

  function normalize(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  const handleDetected = useCallback(
    ({ data }) => {
      if (handledRef.current) return;

      const normalized = normalize(data);
      if (!normalized) return;

      handledRef.current = true;

      onDetected?.(normalized);
    },
    [onDetected],
  );

  return (
    <View style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        active
        barcodeTypes={["ean13", "ean8", "upc_a"]}
        showControls
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
      />

      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  closeBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
