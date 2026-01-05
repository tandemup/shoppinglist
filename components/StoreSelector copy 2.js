import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * StoreSelector
 *
 * Props:
 * - store: store seleccionado o null
 * - onPress: callback para abrir selección de tienda
 */
export default function StoreSelector({ store, onPress }) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icono */}
      <Ionicons
        name="storefront"
        size={20}
        color={store ? "#2e7d32" : "#999"}
        style={styles.icon}
      />

      {/* Texto */}
      <View style={styles.content}>
        <Text style={styles.label}>Tienda seleccionada</Text>

        {store ? (
          <>
            <Text style={styles.name}>{store.name}</Text>

            {store.address ? (
              <Text style={styles.meta}>{store.address}</Text>
            ) : store.city ? (
              <Text style={styles.meta}>{store.city}</Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.placeholder}>Seleccionar tienda</Text>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  icon: {
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  meta: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  placeholder: {
    fontSize: 15,
    color: "#999",
  },
});
