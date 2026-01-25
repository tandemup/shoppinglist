import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function BarcodeScannerEAN13({ onDetected }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const handleBarcodeScanned = ({ data, type }) => {
    // EAN-13 → 13 dígitos numéricos
    if (/^\d{13}$/.test(data)) {
      setScanned(true);
      onDetected?.(data);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Necesitamos permiso para usar la cámara</Text>
        <Pressable onPress={requestPermission}>
          <Text style={styles.button}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.text}>Apunta al código de barras (EAN-13)</Text>

        {scanned && (
          <Pressable onPress={() => setScanned(false)}>
            <Text style={styles.button}>Escanear de nuevo</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  button: {
    color: "#00ff88",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
