import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UnifiedBarcodeScanner from "../../components/features/scanner/UnifiedBarcodeScanner";

export default function BarcodeScannerView({
  mode = "quick", // "quick" | "detail"
  onDetected,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState(null);

  const handledRef = useRef(false);

  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  const handleDetected = useCallback(
    async ({ data }) => {
      if (!data || handledRef.current) return;

      const normalized = normalizeBarcode(data);
      if (!normalized) return;

      handledRef.current = true;
      setLastCode(normalized);

      if (mode === "quick") {
        try {
          setLoading(true);

          const url = `https://www.google.com/search?q=${normalized}`;
          await Linking.openURL(url);
        } finally {
          setLoading(false);
          handledRef.current = false;
        }
      } else {
        onDetected?.(normalized);
        onClose?.();
      }
    },
    [mode, onDetected, onClose],
  );

  return (
    <SafeAreaView style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        active
        barcodeTypes={["ean13", "ean8", "upc_a", "upc_e"]}
        showControls={!loading}
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
      />

      {/* BOTÓN X ÚNICO */}
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>

      {/* OVERLAY */}
      <View style={styles.overlay} pointerEvents="none">
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.subText}>Buscando producto…</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              {mode === "quick"
                ? "Escaneo automático activo"
                : "Apunta al código"}
            </Text>

            {lastCode && <Text style={styles.subText}>Código: {lastCode}</Text>}
          </>
        )}
      </View>
    </SafeAreaView>
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
    zIndex: 999,
  },

  overlay: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
  },

  subText: {
    color: "#aaa",
    fontSize: 14,
  },
});
