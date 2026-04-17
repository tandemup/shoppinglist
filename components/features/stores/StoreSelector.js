import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StoreSelector({
  store,
  onPress,
  onInfoPress,
  disabled = false,
}) {
  const handleInfo = (e) => {
    e?.stopPropagation?.(); // evita disparar el onPress principal
    if (store && onInfoPress) {
      onInfoPress(store);
    }
  };

  const content = (
    <>
      {/* 🏬 Icono tienda → abre info */}
      <TouchableOpacity onPress={handleInfo} disabled={!store} hitSlop={10}>
        <Ionicons
          name="storefront"
          size={20}
          color={disabled ? "#999" : store ? "#007bff" : "#9ca3af"}
        />
      </TouchableOpacity>

      {/* 📝 Texto */}
      <View style={styles.middleColumn}>
        <Text style={styles.label}>Tienda seleccionada</Text>

        <Text style={styles.name} numberOfLines={1}>
          {store?.name || "Seleccionar tienda"}
        </Text>

        {/* 🔒 reservamos espacio siempre */}
        <Text style={styles.address} numberOfLines={1}>
          {store?.address || " "}
        </Text>
      </View>

      {/* 👉 acciones derecha */}
      <View style={styles.rightActions}>
        {/* ℹ️ opcional (redundante pero claro UX) */}
        {store && !disabled && (
          <TouchableOpacity
            onPress={handleInfo}
            hitSlop={10}
            style={{ marginRight: 8 }}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#007bff"
            />
          </TouchableOpacity>
        )}

        {!disabled && (
          <Ionicons name="chevron-forward" size={20} color="#777" />
        )}
      </View>
    </>
  );

  if (disabled) {
    return <View style={[styles.box, styles.disabledBox]}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={[
        styles.box,
        store && { borderColor: "#007bff" }, // estado activo
      ]}
      onPress={onPress}
      onLongPress={handleInfo} // 🔥 longpress → info
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
}

/* ------------------------------------------------- */

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 64,

    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  disabledBox: {
    backgroundColor: "#f9fafb",
    borderColor: "#eee",
  },

  middleColumn: {
    marginLeft: 12,
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  address: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
});
