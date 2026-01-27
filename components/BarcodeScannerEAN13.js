import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/* -----------------------------------------
   🔍 CONFIGURACIÓN
------------------------------------------ */
const ZOOM_LEVELS = [0, 0.15, 0.3, 0.45];
const ZOOM_LABELS = ["1x", "1.3x", "1.6x", "2x"];

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e"];

/* -----------------------------------------
   📦 COMPONENTE
------------------------------------------ */
export default function BarcodeScannerEAN13({ onDetected }) {
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  const [barcodeIndex, setBarcodeIndex] = useState(0);
  const barcodeType = BARCODE_TYPES[barcodeIndex];

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  /* -----------------------------------------
     🔄 ACCIONES
  ------------------------------------------ */
  const cycleZoom = () => {
    setZoomIndex((prev) => (prev + 1) % ZOOM_LEVELS.length);
  };

  const cycleBarcodeType = () => {
    setBarcodeIndex((prev) => (prev + 1) % BARCODE_TYPES.length);
  };

  const handleBarcodeScanned = ({ data }) => {
    // Validación básica por tipo (numérico)
    if (/^\d+$/.test(data)) {
      setScanned(true);

      // 🔄 Reset visual
      setTorch(false);
      setZoomIndex(0);

      onDetected?.(data);
    }
  };

  /* -----------------------------------------
     🔐 PERMISOS
  ------------------------------------------ */
  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para usar la cámara</Text>
        <Pressable onPress={requestPermission}>
          <Text style={styles.permissionButton}>Conceder permiso</Text>
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
        barcodeScannerSettings={{
          barcodeTypes: [barcodeType],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        enableTorch={torch}
        zoom={zoom}
      />

      {/* 🔘 CONTROLES LATERALES (BAJO LA X) */}
      {!scanned && (
        <View style={styles.sideControls}>
          {/* 🔦 ANTORCHA */}
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

          {/* 🔍 ZOOM */}
          <Pressable style={styles.controlButton} onPress={cycleZoom}>
            <MaterialCommunityIcons
              name="magnify-plus-outline"
              size={24}
              color={zoomIndex > 0 ? "#22c55e" : "white"}
            />
            <Text style={styles.controlLabel}>{ZOOM_LABELS[zoomIndex]}</Text>
          </Pressable>

          {/* 🏷️ TIPO DE BARCODE */}
          <Pressable style={styles.controlButton} onPress={cycleBarcodeType}>
            <MaterialCommunityIcons
              name="barcode-scan"
              size={24}
              color="#22c55e"
            />
            <Text style={styles.controlLabel}>{barcodeType.toUpperCase()}</Text>
          </Pressable>
        </View>
      )}

      {/* 📝 TEXTO INFERIOR */}
      <View style={styles.overlay}>
        <Text style={styles.text}>
          Apunta al código de barras ({barcodeType.toUpperCase()})
        </Text>

        {scanned && (
          <Pressable
            onPress={() => {
              setScanned(false);
              setTorch(false);
              setZoomIndex(0);
            }}
          >
            <Text style={styles.retryButton}>Escanear de nuevo</Text>
          </Pressable>
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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionButton: {
    marginTop: 12,
    color: "#2563eb",
    fontSize: 16,
    fontWeight: "600",
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
    bottom: 40,
    alignSelf: "center",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },

  retryButton: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
  },
});
