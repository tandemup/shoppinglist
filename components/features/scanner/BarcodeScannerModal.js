import React from "react";
import { Modal, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UnifiedBarcodeScanner from "./UnifiedBarcodeScanner";

export default function BarcodeScannerModal({
  visible,
  onClose,
  onDetected,
  mode = "manual",
  barcodeTypes = ["ean13", "ean8"],
  hintText = "Apunta al código de barras",
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <UnifiedBarcodeScanner
          mode={mode}
          barcodeTypes={barcodeTypes}
          hintText={hintText}
          onDetected={(data) => {
            onDetected?.(data);
            onClose?.();
          }}
          onCancel={onClose}
        />

        {/* Botón cerrar */}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={30} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
});
