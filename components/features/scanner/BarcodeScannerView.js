import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import UnifiedBarcodeScanner from "../../../components/features/scanner/UnifiedBarcodeScanner";
import { getSearchSettings } from "../../../src/storage/settingsStorage";
import {
  SEARCH_ENGINES,
  DEFAULT_ENGINE,
} from "../../../constants/searchEngines";

export default function BarcodeScannerView({
  visible = true,
  variant = "modal", // "modal" | "full"
  mode = "auto",
  onDetected,
  onClose,
  quickMode = false, // 🔥 sustituye ScannerQuickMode
}) {
  const handledRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState(null);

  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  const resolveEngineKey = useCallback(async () => {
    try {
      const settings = await getSearchSettings();
      return settings?.generalEngine || DEFAULT_ENGINE;
    } catch {
      return DEFAULT_ENGINE;
    }
  }, []);

  const handleDetected = useCallback(
    async ({ data }) => {
      if (!data || handledRef.current) return;

      const normalized = normalizeBarcode(data);
      if (!normalized) return;

      handledRef.current = true;
      setLastCode(normalized);

      // 🔥 QUICK MODE (antes ScannerQuickMode)
      if (quickMode) {
        try {
          setLoading(true);

          const engineKey = await resolveEngineKey();
          const engine =
            SEARCH_ENGINES[engineKey] ?? SEARCH_ENGINES[DEFAULT_ENGINE];

          await Linking.openURL(engine.buildUrl(normalized));
        } finally {
          setLoading(false);
          handledRef.current = false;
        }
      } else {
        onDetected?.(normalized);
        onClose?.();
      }
    },
    [quickMode, onDetected, onClose],
  );

  const content = (
    <SafeAreaView style={styles.container}>
      <UnifiedBarcodeScanner
        mode={mode}
        active={visible}
        initialZoomIndex={0}
        barcodeTypes={["ean13", "ean8", "upc_a", "upc_e"]}
        showControls={!loading}
        showHint
        hintText="Apunta al código"
        onDetected={handleDetected}
        onCancel={onClose}
      />

      {/* X ÚNICO */}
      <Pressable style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </Pressable>

      {/* Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.subText}>Buscando producto…</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              {quickMode
                ? "Escaneo automático activo"
                : "Apunta al código de barras"}
            </Text>

            {lastCode && <Text style={styles.subText}>Código: {lastCode}</Text>}
          </>
        )}
      </View>
    </SafeAreaView>
  );

  if (variant === "modal") {
    return <Modal visible={visible}>{content}</Modal>;
  }

  return content;
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
