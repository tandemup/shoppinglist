import React, { useCallback } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { settingsStorage } from "../src/storage";
import { SEARCH_ENGINES, DEFAULT_ENGINE } from "../constants/searchEngines";

export default function BarcodeLink({ barcode }) {
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

  return (
    <Pressable onPress={handlePress}>
      <View>
        <Text>Buscar código</Text>
      </View>
    </Pressable>
  );
}
