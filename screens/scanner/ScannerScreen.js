import React from "react";
import BarcodeScannerView from "./BarcodeScannerView";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ScannerScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const onScan = route.params?.onScan;

  function handleDetected(code) {
    onScan?.(code);
    navigation.goBack();
  }

  return (
    <BarcodeScannerView
      onDetected={handleDetected}
      onClose={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  selectorWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectorButtonActive: {
    backgroundColor: "#2563eb",
  },
  selectorText: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  selectorTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
});
