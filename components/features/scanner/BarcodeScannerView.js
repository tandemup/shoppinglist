import React, { useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UnifiedBarcodeScanner from "./UnifiedBarcodeScanner";

export default function BarcodeScannerView({ onDetected, onClose }) {
  const handledRef = useRef(false);

  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  const handleDetected = useCallback(
    ({ data }) => {
      if (!data || handledRef.current) return;

      const normalized = normalizeBarcode(data);
      if (!normalized) return;

      handledRef.current = true;

      onDetected?.(normalized);
    },
    [onDetected],
  );

  return (
    <SafeAreaView style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        active={true}
        barcodeTypes={["ean13"]} // 🔥 SOLO EAN13 → más rápido
        showControls={false} // 🔥 menos UI → más rendimiento
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
      />

      {/* Botón cerrar */}
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

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
    zIndex: 999,
  },
});
