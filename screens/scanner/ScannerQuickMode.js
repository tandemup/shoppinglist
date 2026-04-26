import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import UnifiedBarcodeScanner from "../../components/features/scanner/UnifiedBarcodeScanner";
import { getSearchSettings } from "../../src/storage/settingsStorage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../../constants/searchEngines";
import { addScannedItem } from "../../services/scannerHistory";

export default function ScannerQuickMode({ embedded = false }) {
  const Wrapper = embedded ? View : SafeAreaView;
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState(null);
  const [scannerActive, setScannerActive] = useState(true);

  // 🔥 evita múltiples detecciones
  const handledRef = useRef(false);

  const resolveEngineKey = useCallback(async () => {
    try {
      const settings = await getSearchSettings();

      if (settings?.generalEngine && SEARCH_ENGINES[settings.generalEngine]) {
        return settings.generalEngine;
      }

      if (settings?.productEngine && SEARCH_ENGINES[settings.productEngine]) {
        return settings.productEngine;
      }

      if (settings?.productEngines?.googleShopping) {
        return "google_shopping";
      }

      return DEFAULT_ENGINE;
    } catch {
      return DEFAULT_ENGINE;
    }
  }, []);

  // 🔥 normalización robusta
  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");
    if (clean.length === 13 || clean.length === 8) return clean;
    return null;
  }

  const handleDetected = useCallback(
    async ({ data }) => {
      if (!scannerActive) return;
      if (!data || handledRef.current) return;

      const normalized = normalizeBarcode(data);
      if (!normalized) return;

      handledRef.current = true;
      setLoading(true);
      setLastCode(normalized);

      try {
        await addScannedItem({
          barcode: normalized,
          scannedAt: new Date().toISOString(),
          source: "scanner",
        });

        const engineKey = await resolveEngineKey();
        const engine =
          SEARCH_ENGINES[engineKey] ?? SEARCH_ENGINES[DEFAULT_ENGINE];

        const url = engine.buildUrl(normalized);

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (err) {
        console.warn("Error en QuickMode", err);
      } finally {
        setLoading(false);
        handledRef.current = false; // 🔥 permite siguiente escaneo
      }
    },
    [resolveEngineKey, scannerActive],
  );

  function handleClose() {
    setScannerActive(false);
    handledRef.current = false;

    // 🔥 si es pantalla completa → volver atrás
    if (!embedded) {
      navigation.goBack();
    }
  }

  return (
    <Wrapper style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        active={scannerActive}
        barcodeTypes={["ean13", "ean8", "upc_a", "upc_e"]}
        hintText="Apunta al código (modo rápido)"
        onDetected={handleDetected}
        showControls={!loading}
      />

      {/* BOTÓN X ÚNICO */}
      {scannerActive && (
        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      )}

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
              {scannerActive ? "Escaneo automático activo" : "Escaneo detenido"}
            </Text>

            {lastCode ? (
              <Text style={styles.subText}>Código: {lastCode}</Text>
            ) : (
              <Text style={styles.subText}>
                Compatible con EAN-13, EAN-8 y UPC
              </Text>
            )}
          </>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  overlay: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    maxWidth: 260,
  },

  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 6,
    textAlign: "center",
  },

  subText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
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

  closeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});
