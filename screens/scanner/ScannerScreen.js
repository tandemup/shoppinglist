import React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import BarcodeScannerView from "../../components/features/scanner/BarcodeScannerView";

export default function ScannerScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // Callback recibido desde la pantalla que abre el scanner
  const onScan = route.params?.onScan;

  function handleDetected(code) {
    // Devolver código al origen
    onScan?.(code);

    // Volver atrás
    navigation.goBack();
  }

  function handleClose() {
    navigation.goBack();
  }

  return (
    <BarcodeScannerView onDetected={handleDetected} onClose={handleClose} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
