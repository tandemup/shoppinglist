import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  AppState,
  Linking,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ScannerControls from "../../components/features/scanner/ScannerControls";
import { getSearchSettings } from "../../src/storage/settingsStorage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../../constants/searchEngines";
import { addScannedItem } from "../../services/scannerHistory";
import { SCANNER_ZOOM, getZoomValue } from "../../constants/cameraZoom";

export default function ScannerQuickMode({ embedded = false }) {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastCode, setLastCode] = useState(null);

  const scanLock = useRef(false);

  const [torch, setTorch] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(1);
  const zoom = getZoomValue(SCANNER_ZOOM, zoomIndex);

  const Wrapper = embedded ? View : SafeAreaView;

  const resetScanner = useCallback(() => {
    scanLock.current = false;
    setScanned(false);
    setScanningEnabled(false);
    setLoading(false);
    setLastCode(null);
    setTorch(false);
    setZoomIndex(1);
  }, []);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        resetScanner();
      }
    });

    return () => sub.remove();
  }, [resetScanner]);

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
    } catch (error) {
      console.warn("Error leyendo ajustes de búsqueda", error);
      return DEFAULT_ENGINE;
    }
  }, []);

  const handleBarcodeScanned = useCallback(
    async ({ data }) => {
      if (!data || scanLock.current || !scanningEnabled) return;

      scanLock.current = true;
      setScanningEnabled(false);
      setScanned(true);
      setLoading(true);
      setLastCode(data);

      try {
        await addScannedItem({
          barcode: data,
          scannedAt: new Date().toISOString(),
          source: "scanner",
        });

        const engineKey = await resolveEngineKey();
        const engineConfig =
          SEARCH_ENGINES[engineKey] ?? SEARCH_ENGINES[DEFAULT_ENGINE];

        const url = engineConfig.buildUrl(data);
        const canOpen = await Linking.canOpenURL(url);

        if (!canOpen) {
          throw new Error("No se puede abrir la URL");
        }

        await Linking.openURL(url);
      } catch (error) {
        console.warn("Error procesando el escaneo", error);
        resetScanner();
      } finally {
        setLoading(false);
      }
    },
    [resetScanner, resolveEngineKey, scanningEnabled],
  );

  if (!permission) {
    return (
      <Wrapper style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.text}>Solicitando acceso a la cámara…</Text>
      </Wrapper>
    );
  }

  if (!permission.granted) {
    return (
      <Wrapper style={styles.center}>
        <Text style={styles.text}>Necesitamos permiso para usar la cámara</Text>
        <Pressable onPress={requestPermission}>
          <Text style={styles.button}>Conceder permiso</Text>
        </Pressable>
      </Wrapper>
    );
  }

  return (
    <Wrapper style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        zoom={zoom}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanningEnabled ? handleBarcodeScanned : undefined}
      />

      {!loading && (
        <ScannerControls
          torch={torch}
          zoomIndex={zoomIndex}
          zoomLabels={SCANNER_ZOOM.labels}
          onToggleTorch={() => setTorch((v) => !v)}
          onZoomPress={() =>
            setZoomIndex((i) => (i + 1) % SCANNER_ZOOM.levels.length)
          }
        />
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.subText}>Buscando producto…</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>
              {scanningEnabled ? "Escaneando..." : "Apunta al código de barras"}
            </Text>

            {lastCode ? (
              <Text style={styles.subText}>Código: {lastCode}</Text>
            ) : (
              <Text style={styles.subText}>
                Compatible con EAN-13, EAN-8 y UPC
              </Text>
            )}

            <Pressable
              style={[
                styles.scanButton,
                scanningEnabled && styles.scanButtonActive,
              ]}
              onPress={() => {
                if (scanningEnabled) {
                  scanLock.current = false;
                  setScanningEnabled(false);
                  return;
                }

                scanLock.current = false;
                setScanned(false);
                setLastCode(null);
                setLoading(false);
                setScanningEnabled(true);
              }}
            >
              <MaterialCommunityIcons
                name={scanningEnabled ? "stop-circle-outline" : "barcode-scan"}
                size={22}
                color="#fff"
              />
              <Text style={styles.scanButtonText}>
                {scanningEnabled ? "Detener" : "Escanear"}
              </Text>
            </Pressable>

            {scanned && !scanningEnabled ? (
              <Pressable onPress={resetScanner} style={styles.retryButton}>
                <Text style={styles.button}>Reiniciar</Text>
              </Pressable>
            ) : null}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 24,
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
  scanButton: {
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  scanButtonActive: {
    backgroundColor: "#16a34a",
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  retryButton: {
    marginTop: 12,
  },
});
