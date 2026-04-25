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

import UnifiedBarcodeScanner from "../../components/features/scanner/UnifiedBarcodeScanner";
import { getSearchSettings } from "../../src/storage/settingsStorage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../../constants/searchEngines";
import { addScannedItem } from "../../services/scannerHistory";

export default function ScannerQuickMode({ embedded = false }) {
  const Wrapper = embedded ? View : SafeAreaView;

  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState(null);

  const isProcessingRef = useRef(false);

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

  const handleDetected = useCallback(
    async ({ data }) => {
      if (!data || isProcessingRef.current) return;

      isProcessingRef.current = true;
      setLoading(true);
      setLastCode(data);

      try {
        await addScannedItem({
          barcode: data,
          scannedAt: new Date().toISOString(),
          source: "scanner",
        });

        const engineKey = await resolveEngineKey();
        const engine =
          SEARCH_ENGINES[engineKey] ?? SEARCH_ENGINES[DEFAULT_ENGINE];

        const url = engine.buildUrl(data);

        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (err) {
        console.warn("Error en QuickMode", err);
      } finally {
        setLoading(false);
        isProcessingRef.current = false;
      }
    },
    [resolveEngineKey],
  );

  return (
    <Wrapper style={styles.container}>
      <UnifiedBarcodeScanner
        mode="auto"
        barcodeTypes={["ean13", "ean8", "upc_a", "upc_e"]}
        hintText="Apunta al código (modo rápido)"
        onDetected={handleDetected}
        showControls={!loading}
      />

      <View style={styles.overlay} pointerEvents="none">
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.subText}>Buscando producto…</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>Escaneo automático activo</Text>

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
});
