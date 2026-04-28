import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import UnifiedBarcodeScanner from "./UnifiedBarcodeScanner";

export default function BarcodeScannerView({
  onDetected,
  onClose,
  continuous = true,
  duplicateCooldownMs = 1500,
  showControls = true,
}) {
  const handledRef = useRef(false);
  const lastCodeRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isFocused = useIsFocused();

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

  useEffect(() => {
    if (isFocused) {
      handledRef.current = false;
      lastCodeRef.current = null;
      lastTimeRef.current = 0;
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <UnifiedBarcodeScanner
        mode="manual"
        active={true}
        barcodeTypes={["ean13"]}
        showControls={showControls}
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
        continuous={continuous}
        scanCooldownMs={duplicateCooldownMs}
      />

      {!showControls ? (
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      ) : null}
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
