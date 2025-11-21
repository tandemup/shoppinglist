// components/BarcodeScanner.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useConfig } from "../context/ConfigContext";

export default function BarcodeScanner({
  onScanned,
  onCancel,
  onReenable,
  active = true,
}) {
  const { config } = useConfig();

  const [scanningEnabled, setScanningEnabled] = useState(true);
  const lastScanRef = useRef(0);
  const cameraRef = useRef(null);

  //
  // 🧠 Anti-doble escaneo: 1 escaneo cada 1.2 segundos
  //
  const MIN_DELAY = 1200;

  const handleBarCodeScanned = ({ data }) => {
    if (!scanningEnabled) return;

    const now = Date.now();
    if (now - lastScanRef.current < MIN_DELAY) return; // Evita dobles
    lastScanRef.current = now;

    // 🚫 Desactivar escaneo temporalmente
    setScanningEnabled(false);

    // Enviar código al componente padre (ScannerTab)
    onScanned && onScanned(data);

    // Reactivar escaneo luego de un tiempo
    setTimeout(() => {
      setScanningEnabled(true);
      onReenable && onReenable();
    }, 1500);
  };

  //
  // 🛑 Cancelar la cámara
  //
  const handleCancel = () => {
    setScanningEnabled(false);
    onCancel && onCancel();
  };

  //
  // 🎥 Render cámara o mensaje desactivado
  //
  return (
    <View style={styles.wrapper}>
      {active ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      ) : (
        <View style={styles.disabledView}>
          <Text style={styles.disabledText}>Cámara desactivada</Text>
        </View>
      )}

      {/* Botón cancelar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cancelBtn} onPress={handleCancel}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={28}
            color="#fff"
          />
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  disabledView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  disabledText: {
    color: "#aaa",
    fontSize: 16,
  },

  bottomBar: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  cancelBtn: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "bold",
    fontSize: 16,
  },
});
