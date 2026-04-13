import React, { useCallback } from "react";
import { Linking, Pressable, Text } from "react-native";
import { settingsStorage } from "../src/storage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../constants/searchEngines";

export default function BarcodeLink({ barcode, label, iconColor = "#2563eb" }) {
  const handlePress = useCallback(
    async (e) => {
      e.stopPropagation();

      try {
        const selectedKey = await settingsStorage.getSearchEngine();
        const engine =
          SEARCH_ENGINES[selectedKey] || SEARCH_ENGINES[DEFAULT_ENGINE];

        const url = engine.buildUrl(barcode);
        await Linking.openURL(url);
      } catch (error) {
        console.warn("Error opening barcode link", error);
      }
    },
    [barcode],
  );

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
