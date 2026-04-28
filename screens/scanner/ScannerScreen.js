import React, { useRef } from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import BarcodeScannerView from "../../components/features/scanner/BarcodeScannerView";
import { updateScannedEntry } from "../../services/scannerHistory";

export default function ScannerScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const isHandlingScanRef = useRef(false);

  const onScan = route.params?.onScan;

  const continuous = route.params?.continuous ?? false;
  const closeOnScan = route.params?.closeOnScan ?? true;

  const shouldSaveToHistory = route.params?.saveToHistory ?? !onScan;

  async function saveDetectedBarcode(code) {
    const barcode = String(code || "").trim();

    if (!barcode) return null;

    const now = new Date().toISOString();

    const scannedItem = {
      id: barcode,
      barcode,
      name: "",
      brand: "",
      url: "",
      imageUrl: "",
      thumbnailUri: null,
      notes: "",
      source: "scanner",
      scannedAt: now,
      updatedAt: now,
      scanCount: 1,
    };

    await updateScannedEntry(barcode, scannedItem);

    return scannedItem;
  }

  async function handleDetected(code) {
    if (isHandlingScanRef.current) return;

    isHandlingScanRef.current = true;

    try {
      if (typeof onScan === "function") {
        onScan(code);
      }

      if (shouldSaveToHistory) {
        await saveDetectedBarcode(code);
      }

      if (closeOnScan) {
        navigation.goBack();
      }
    } catch (error) {
      console.log("Error handling scanned barcode:", error);

      if (closeOnScan) {
        navigation.goBack();
      }
    } finally {
      setTimeout(() => {
        isHandlingScanRef.current = false;
      }, 800);
    }
  }

  function handleClose() {
    navigation.goBack();
  }

  return (
    <BarcodeScannerView
      onDetected={handleDetected}
      onClose={handleClose}
      continuous={continuous}
      showControls={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
