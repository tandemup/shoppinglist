// ScannerTab.js — versión clásica con 3 botones + fixes internos

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

import { addScannedProductFull } from "../utils/storage/scannerHistory";
import {
  isISBN,
  fetchBookInfo,
  fetchProductInfo,
} from "../utils/scannerHelpers";

export default function ScannerTab({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [torch, setTorch] = useState(false);
  const [zoom] = useState(0);

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  const zoomRef = useRef(0);

  // -------------------------------------------------
  // Permisos de cámara
  // -------------------------------------------------
  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 15 }}>
          Necesitamos permiso para usar la cámara.
        </Text>
        <TouchableOpacity style={styles.bigButton} onPress={requestPermission}>
          <Text style={styles.bigButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // -------------------------------------------------
  // Lógica principal del escaneo
  // -------------------------------------------------
  const handleScan = async ({ data }) => {
    if (loading) return;
    setLoading(true);

    console.log("📸 Escaneado:", data);

    let meta = null;
    let isBook = false;

    try {
      if (isISBN(data)) {
        isBook = true;
        meta = await fetchBookInfo(data);
      } else {
        meta = await fetchProductInfo(data);
      }
    } catch (e) {
      console.log("Error obteniendo info:", e);
    }

    meta = {
      name: meta?.name ?? "Producto desconocido",
      brand: meta?.brand ?? "",
      image: meta?.image ?? null,
      url: meta?.url ?? null,
    };

    // Mostrar info básica en pantalla
    setInfo({
      code: data,
      name: meta.name,
      brand: meta.brand,
      image: meta.image,
      isBook,
    });

    // Guardar en historial de escaneos
    await addScannedProductFull({
      id: Date.now().toString(),
      code: data,
      name: meta.name,
      brand: meta.brand,
      image: meta.image,
      isBook,
      scannedAt: new Date().toISOString(),
      source: "scanner",
    });

    console.log("💾 Guardado correctamente en historial");

    setLoading(false);
  };

  // -------------------------------------------------
  // UI principal
  // -------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      {/* Cámara */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        zoom={zoomRef.current}
        autoFocus="on"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
        }}
        onBarcodeScanned={(event) => {
          if (!scanningEnabled) return; // 🔥 FIX CRÍTICO
          setScanningEnabled(false);
          handleScan(event);
        }}
      />

      {/* Información simple debajo (UI original de 1 línea) */}
      {info && (
        <View style={styles.infoBox}>
          <Text style={styles.infoName}>{info.name}</Text>
          {info.brand ? (
            <Text style={styles.infoBrand}>{info.brand}</Text>
          ) : null}
          {info.image ? (
            <Image source={{ uri: info.image }} style={styles.infoImg} />
          ) : null}
          <Text style={styles.infoCode}>Código: {info.code}</Text>
        </View>
      )}

      {/* LOADING */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "white", marginTop: 5 }}>Procesando…</Text>
        </View>
      )}

      {/* ---------------------------- */}
      {/*    BARRA DE TRES BOTONES     */}
      {/* ---------------------------- */}

      <View style={styles.buttonBar}>
        {/* 🔦 Linterna */}
        <TouchableOpacity
          style={styles.barButton}
          onPress={() => setTorch((v) => !v)}
        >
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            size={30}
            color="white"
          />
          <Text style={styles.barButtonText}>Linterna</Text>
        </TouchableOpacity>

        {/* 🔄 Re-escanear */}
        <TouchableOpacity
          style={styles.barButton}
          onPress={() => {
            setInfo(null);
            setScanningEnabled(true);
          }}
        >
          <Ionicons name="scan" size={30} color="white" />
          <Text style={styles.barButtonText}>Escanear</Text>
        </TouchableOpacity>

        {/* 📚 Historial */}
        <TouchableOpacity
          style={styles.barButton}
          onPress={() => navigation.navigate("ScannedHistory")}
        >
          <Ionicons name="time" size={30} color="white" />
          <Text style={styles.barButtonText}>Historial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBox: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  infoName: { color: "white", fontSize: 18, fontWeight: "700" },
  infoBrand: { color: "#ccc", marginTop: 3 },
  infoCode: { color: "#ddd", marginTop: 5 },
  infoImg: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },

  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },

  barButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: 110,
  },

  barButtonText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },

  bigButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
  },
  bigButtonText: {
    fontSize: 16,
    color: "white",
  },
});
