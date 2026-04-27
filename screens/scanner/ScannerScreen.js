import React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import BarcodeScannerView from "../../components/features/scanner/BarcodeScannerView";

export default function ScannerScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const onScan = route.params?.onScan;

  function handleDetected(code) {
    onScan?.(code);
    navigation.goBack();
  }

  function handleClose() {
    navigation.goBack();
  }

  return (
    <BarcodeScannerView
      onDetected={handleDetected}
      onClose={handleClose}
      continuous={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
