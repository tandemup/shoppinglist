import React from "react";
import { Text, View, Pressable, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BarcodeLink({
  barcode,
  styleType = "subtle",
  iconColor = "#6b7280",
}) {
  if (!barcode) return null;

  const url = `https://www.google.com/search?q=${barcode}`;

  const styles = {
    default: { fontSize: 14, color: "#1d4ed8" },
    subtle: { fontSize: 12, color: "#6b7280" },
  };

  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation();
        Linking.openURL(url);
      }}
      style={Platform.OS === "web" ? { display: "inline-flex" } : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name="barcode-outline"
          size={14}
          color={iconColor}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles[styleType], { textDecorationLine: "underline" }]}>
          {barcode}
        </Text>
      </View>
    </Pressable>
  );
}
