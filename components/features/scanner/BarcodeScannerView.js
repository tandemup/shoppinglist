import React, { useCallback, useRef } from "react";
import { View, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UnifiedBarcodeScanner from "./UnifiedBarcodeScanner";

export default function BarcodeScannerView({
  onDetected,
  onClose,
  continuous = false,
  duplicateCooldownMs = 1500,
}) {
  const handledRef = useRef(false);
  const lastCodeRef = useRef(null);
  const lastTimeRef = useRef(0);

  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  function isDuplicateTooSoon(code) {
    const now = Date.now();

    const sameCode = lastCodeRef.current === code;
    const tooSoon = now - lastTimeRef.current < duplicateCooldownMs;

    if (sameCode && tooSoon) {
      return true;
    }

    lastCodeRef.current = code;
    lastTimeRef.current = now;

    return false;
  }

  const handleDetected = useCallback(
    ({ data }) => {
      if (!data) return;

      const normalized = normalizeBarcode(data);
      if (!normalized) return;

      if (!continuous && handledRef.current) return;

      if (continuous && isDuplicateTooSoon(normalized)) return;

      handledRef.current = true;

      onDetected?.(normalized);
    },
    [onDetected, continuous, duplicateCooldownMs],
  );

  return (
    <SafeAreaView style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        active={true}
        barcodeTypes={["ean13"]}
        showControls={false}
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
        continuous={continuous}
        scanCooldownMs={1200}
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
