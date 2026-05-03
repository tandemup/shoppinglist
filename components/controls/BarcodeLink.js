import React, { useCallback } from "react";
import { Linking, Pressable, Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import { showOptions } from "../../utils/ui/primitives/ActionSheet";

//import { settingsStorage } from "../../src/storage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../../constants/searchEngines";

export default function BarcodeLink({ barcode, label, iconColor = "#2563eb" }) {
  const selectedEngine = DEFAULT_ENGINE;
  const openSearch = (query) => {
    const engine = SEARCH_ENGINES[selectedEngine];

    if (!engine) {
      console.warn("Engine no encontrado:", selectedEngine);
      return;
    }

    const url = engine.buildUrl(query);
    Linking.openURL(url);
  };
  const handlePress = useCallback(() => {
    if (!barcode) return;

    showOptions("Barcodes", [
      {
        text: "Copiar",
        onPress: () => Clipboard.setStringAsync(barcode),
      },
      {
        text: "Buscar",
        onPress: () => openSearch(barcode),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  }, [barcode]);

  if (!barcode) return null;

  return (
    <Pressable onPress={handlePress}>
      <Text
        style={{
          color: iconColor,
          fontSize: 13,
          fontWeight: "600",
          textDecorationLine: "underline",
        }}
      >
        {label || barcode}
      </Text>
    </Pressable>
  );
}
