// components/StoreSelector.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StoreSelector({ store, onPress, disabled = false }) {
  const Container = disabled ? View : TouchableOpacity;

  return (
    <Container
      style={[styles.box, disabled && styles.disabledBox]}
      onPress={!disabled ? onPress : undefined}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Ionicons
        name="storefront"
        size={20}
        color={disabled ? "#999" : "#007bff"}
      />

      <View style={styles.middleColumn}>
        <Text style={styles.label}>Tienda seleccionada</Text>

        {store ? (
          <>
            <Text style={[styles.name, disabled && styles.disabledText]}>
              {store.name}
            </Text>

            {!!store.address && (
              <Text style={[styles.address, disabled && styles.disabledText]}>
                {store.address}
              </Text>
            )}
          </>
        ) : (
          <Text style={[styles.placeholder, disabled && styles.disabledText]}>
            Seleccionar tienda
          </Text>
        )}
      </View>

      {!disabled && <Ionicons name="chevron-forward" size={20} color="#777" />}
    </Container>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 12,
  },

  disabledBox: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },

  middleColumn: {
    marginLeft: 12,
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  address: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  placeholder: {
    fontSize: 16,
    color: "#999",
  },

  disabledText: {
    color: "#9ca3af",
  },
});
