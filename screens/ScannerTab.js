import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  AppState,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import ScannerControls from "../components/ScannerControls";

import { getGeneralSearchEngine } from "../utils/config/searchConfig";
import { SEARCH_ENGINES } from "../constants/searchEngines";
import { addScannedItem } from "../services/scannerHistory";

/* -----------------------------------------
   🔍 CONFIGURACIÓN
------------------------------------------ */
import { SCANNER_ZOOM, getZoomValue } from "../constants/cameraZoom";

/* -----------------------------------------
   📦 PANTALLA
------------------------------------------ */
export default function ScannerTab() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState(null);
  const [lastCode, setLastCode] = useState(null);

  // 🔒 bloqueo inmediato
  const scanLock = useRef(false);

  // 🔦 / 🔍
  const [torch, setTorch] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = getZoomValue(SCANNER_ZOOM, zoomIndex);

  /* -----------------------------------------
     🔐 PERMISOS
  ------------------------------------------ */
  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  /* -----------------------------------------
     ⚙️ Motor elegido
  ------------------------------------------ */
  useEffect(() => {
    getGeneralSearchEngine().then(setEngine);
  }, []);

  /* -----------------------------------------
     🔄 Reset al volver a la app
  ------------------------------------------ */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") resetScanner();
    });
    return () => sub.remove();
  }, []);

  /* -----------------------------------------
     🔍 ESCANEO
  ------------------------------------------ */
  const handleBarcodeScanned = useCallback(
    async ({ data }) => {
      if (!data || scanLock.current) return;

      scanLock.current = true;
      setScanned(true);
      setLoading(true);
      setLastCode(data);

      try {
        await addScannedItem({
          barcode: data,
          scannedAt: new Date().toISOString(),
          source: "scanner",
        });

        const engineId = engine ?? (await getGeneralSearchEngine());
        const engineConfig = SEARCH_ENGINES[engineId] ?? SEARCH_ENGINES.google;

        const url = engineConfig.buildUrl(data);
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) throw new Error("No se puede abrir la URL");

        await Linking.openURL(url);
      } catch (e) {
        console.warn("Error procesando el escaneo", e);
        resetScanner();
      } finally {
        setLoading(false);
      }
    },
    [engine],
  );

  /* -----------------------------------------
     🔄 RESET
  ------------------------------------------ */
  const resetScanner = () => {
    scanLock.current = false;
    setScanned(false);
    setLoading(false);
    setLastCode(null);
    setTorch(false);
    setZoomIndex(0);
  };

  /* -----------------------------------------
     🛑 SIN PERMISOS
  ------------------------------------------ */
  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Necesitamos permiso para usar la cámara</Text>
        <Pressable onPress={requestPermission}>
          <Text style={styles.button}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  /* -----------------------------------------
     🖥 RENDER
  ------------------------------------------ */
  return (
    <View style={styles.container}>
      {/* Cámara */}
      <CameraView
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
        enableTorch={torch}
        zoom={zoom}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Controles */}
      {!scanned && !loading && (
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

      {/* Overlay inferior */}
      <View style={styles.overlay} pointerEvents="box-none">
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.subText}>Buscando producto…</Text>
          </>
        ) : (
          <>
            <Text style={styles.text}>Apunta al código de barras</Text>

            {lastCode && <Text style={styles.subText}>Código: {lastCode}</Text>}

            {scanned && (
              <Pressable onPress={resetScanner}>
                <Text style={styles.button}>Escanear de nuevo</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

/* -----------------------------------------
   🎨 ESTILOS
------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
  },

  text: { color: "#fff", fontSize: 16, marginBottom: 8 },
  subText: { color: "#aaa", fontSize: 14, marginBottom: 10 },
  button: { color: "#22c55e", fontSize: 16, fontWeight: "600" },

  controls: {
    position: "absolute",
    top: 110,
    right: 16,
    alignItems: "center",
    gap: 16,
  },

  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  zoomText: {
    color: "#fff",
    fontWeight: "700",
  },

  eanBadge: {
    alignItems: "center",
    marginTop: 4,
  },

  eanText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "600",
  },
});
