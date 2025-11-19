// BarcodeScanner.js limpio y optimizado sin overlay rectangular

import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useConfig } from "../context/ConfigContext";

export default function BarcodeScanner({
  onScanned,
  onCancel,
  onReenable,
  hideScanArea = false, // ahora no se usa
  active = true,
  statusMessage = "",
  statusColor = "#2563eb",
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0.15); // zoom inicial ideal

  const zoomRef = useRef(0.15);
  const zoomDirectionRef = useRef(1);
  const { config } = useConfig();

  // Pedir permisos cámara
  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  // Zoom automático
  useEffect(() => {
    if (!config.scanner.zoomAuto) {
      // Si el zoom automático está apagado → no mover nada
      zoomRef.current = config.scanner.zoom;
      setZoom(config.scanner.zoom);
      return;
    }

    // Si zoomAuto está activado → aplicar movimiento automático
    const interval = setInterval(() => {
      if (!scanningEnabled) return;

      let current = zoomRef.current;
      let dir = zoomDirectionRef.current;

      let next = current + dir * 0.01;

      if (next > 0.28) {
        zoomDirectionRef.current = -1;
        next = 0.28;
      }
      if (next < 0.1) {
        zoomDirectionRef.current = 1;
        next = 0.1;
      }

      zoomRef.current = next;
      setZoom(next);
    }, 450);

    return () => clearInterval(interval);
  }, [scanningEnabled, config.scanner.zoomAuto, config.scanner.zoom]);

  // Manejo del escaneo
  const handleBarcodeScanned = ({ data }) => {
    if (!scanningEnabled || !active) return;
    if (!data) return;

    setScanningEnabled(false);
    onScanned?.({ data });
  };

  // Permiso de cámara
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permiso de cámara…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: "center", marginBottom: 12 }}>
          No se pudo acceder a la cámara.
        </Text>

        <Pressable
          style={styles.secondaryBtn}
          onPress={() => onScanned?.({ data: "8410076470787" })}
        >
          <Text style={styles.secondaryBtnText}>
            Simular escaneo (EAN demo)
          </Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: "#ef4444" }]}
          onPress={onCancel}
        >
          <Text style={styles.primaryBtnText}>Cerrar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        zoom={config.scanner.zoom}
        autoFocus={config.scanner.autoFocus ? "on" : "off"}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: config.scanner.barcodeTypes,
        }}
        onBarcodeScanned={scanningEnabled ? handleBarcodeScanned : undefined}
      />

      {/* Mensaje de estado */}
      {statusMessage ? (
        <View
          style={{
            position: "absolute",
            top: 70,
            alignSelf: "center",
            backgroundColor: statusColor,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            opacity: 0.9,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
            {statusMessage}
          </Text>
        </View>
      ) : null}

      {/* Controles inferiores */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.iconButton}
          onPress={() => setTorch((t) => !t)}
        >
          <MaterialCommunityIcons
            name={torch ? "flashlight" : "flashlight-off"}
            size={26}
            color="#fff"
          />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => {
            setScanningEnabled(true);
            onReenable?.();
          }}
        >
          <MaterialCommunityIcons name="barcode" size={26} color="#fff" />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={onCancel}>
          <MaterialCommunityIcons name="close" size={26} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = {
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  iconButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  primaryBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#FF3B30",
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold" },

  secondaryBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#2563eb",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "bold" },
};
