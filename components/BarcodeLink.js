// BarcodeLink.js
import React from "react";
import { Text, View, Pressable, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BarcodeLink({
  barcode,
  styleType = "default",
  iconColor = "#6b7280",
  underline = true,
  style = {},
}) {
  if (!barcode) return null;

  const url = `https://www.google.com/search?q=${barcode}`;

  const onPress = async (event) => {
    event.stopPropagation();
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.warn("No se pudo abrir el enlace:", err);
    }
  };

  const baseStyles = {
    default: { fontSize: 14, color: "#1d4ed8", fontWeight: "500" },
    subtle: { fontSize: 12, color: "#6b7280", fontWeight: "400" },
    icon: { fontSize: 12, color: "#6b7280", fontWeight: "400" },
  };

  const textStyle = {
    ...baseStyles[styleType],
    textDecorationLine: underline ? "underline" : "none",
    ...style,
  };

  return (
    <Pressable
      onPress={onPress}
      // 👇 ESTA LÍNEA ES LA CLAVE EN WEB: limita el área clicable al contenido
      style={Platform.OS === "web" ? { display: "inline-flex" } : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name="barcode-outline"
          size={14}
          color={iconColor}
          style={{ marginRight: 4 }}
        />
        <Text style={textStyle}>{barcode}</Text>
      </View>
    </Pressable>
  );
}
