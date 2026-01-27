import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  AppState,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import { getGeneralSearchEngine } from "../utils/config/searchConfig";
import { addScannedItem } from "../services/scannerHistory";

/* -----------------------------------------
   🔍 CONFIGURACIÓN
------------------------------------------ */
const ZOOM_LEVELS = [0, 0.15, 0.3, 0.45];
const ZOOM_LABELS = ["1x", "1.3x", "1.6x", "2x"];

/* -----------------------------------------
   📦 COMPONENTE
------------------------------------------ */
export default function ScannerTab() {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState(null);
  const [lastCode, setLastCode] = useState(null);

  // 🔦 / 🔍
  const [torch, setTorch] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

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
      if (!data || scanned || loading) return;

      setScanned(true);
      setLoading(true);
      setLastCode(data);

      try {
        // 📌 1. Guardar en historial
        await addScannedItem({
          barcode: data,
          scannedAt: new Date().toISOString(),
          source: "scanner",
        });

        // 🌍 2. Lanzar búsqueda
        const selectedEngine = engine ?? (await getGeneralSearchEngine());
        await launchSearch(selectedEngine, data);
      } catch (e) {
        console.warn("Error procesando el escaneo", e);
        resetScanner();
      } finally {
        setLoading(false);
      }
    },
    [scanned, loading, engine],
  );

  /* -----------------------------------------
     🌍 BÚSQUEDA
  ------------------------------------------ */
  const launchSearch = async (engineId, barcode) => {
    let url;

    switch (engineId) {
      case "openfoodfacts":
        url = `https://world.openfoodfacts.org/product/${barcode}`;
        break;
      case "google_shopping":
        url = `https://www.google.com/search?tbm=shop&q=${barcode}`;
        break;
      case "duckduckgo":
        url = `https://duckduckgo.com/?q=${barcode}`;
        break;
      case "barcodelookup":
        url = `https://www.barcodelookup.com/${barcode}`;
        break;
      default:
        url = `https://www.google.com/search?q=${barcode}`;
    }

    await Linking.openURL(url);
  };

  /* -----------------------------------------
     🔄 RESET
  ------------------------------------------ */
  const resetScanner = () => {
    setScanned(false);
    setLoading(false);
    setLastCode(null);
    setTorch(false);
    setZoomIndex(0);
  };

  /* -----------------------------------------
     🛑 PERMISOS
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
      {/* 📷 CÁMARA */}
      <CameraView
        style={StyleSheet.absoluteFill}
        enableTorch={torch}
        zoom={zoom}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* 🔘 CONTROLES */}
      {!scanned && (
        <View style={styles.sideControls}>
          <Pressable
            style={styles.controlButton}
            onPress={() => setTorch((v) => !v)}
          >
            <MaterialCommunityIcons
              name={torch ? "flashlight" : "flashlight-off"}
              size={24}
              color={torch ? "#22c55e" : "white"}
            />
          </Pressable>

          <Pressable
            style={styles.controlButton}
            onPress={() => setZoomIndex((i) => (i + 1) % ZOOM_LEVELS.length)}
          >
            <MaterialCommunityIcons
              name="magnify-plus-outline"
              size={24}
              color={zoomIndex > 0 ? "#22c55e" : "white"}
            />
            <Text style={styles.controlLabel}>{ZOOM_LABELS[zoomIndex]}</Text>
          </Pressable>
        </View>
      )}

      {/* 🧭 OVERLAY */}
      <View style={styles.overlay}>
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
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  sideControls: {
    position: "absolute",
    top: 110,
    right: 16,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 26,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    width: 56,
  },
  controlLabel: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  overlay: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  subText: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
