// components/BarcodeScanner.js
import React, { useState, useEffect, useRef } from "react";
import { View, Pressable } from "react-native";
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
  const [torch, setTorch] = useState(false);

  const zoomRef = useRef(config.scanner.zoom);
  const zoomDirectionRef = useRef(1);

  // 📌 Zoom automático
  useEffect(() => {
    if (!config.scanner.zoomAuto) {
      zoomRef.current = config.scanner.zoom;
      return;
    }

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
    }, 380);

    return () => clearInterval(interval);
  }, [scanningEnabled, config.scanner.zoomAuto, config.scanner.zoom]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        zoom={zoomRef.current}
        autoFocus={config.scanner.autoFocus ? "on" : "off"}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: config.scanner.barcodeTypes,
        }}
        onBarcodeScanned={(event) => {
          setScanningEnabled(false);
          onScanned(event);
        }}
      />

      {/* Controles inferiores */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <Pressable onPress={() => setTorch((t) => !t)}>
          <MaterialCommunityIcons
            name={torch ? "flashlight" : "flashlight-off"}
            size={28}
            color="#fff"
          />
        </Pressable>

        <Pressable
          onPress={() => {
            setScanningEnabled(true);
            onReenable?.();
          }}
        >
          <MaterialCommunityIcons name="barcode" size={28} color="#fff" />
        </Pressable>

        <Pressable onPress={onCancel}>
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
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
