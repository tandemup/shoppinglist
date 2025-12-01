// components/StoreSelector.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StoreSelector({ navigation, store, onChangeStore }) {
  const handleSelectStore = () => {
    navigation.navigate("StoresScreen", {
      onSelectStore: async (selected) => {
        onChangeStore(selected); // ⭐ Actualizar SOLO esta lista
      },
    });
  };

  return (
    <TouchableOpacity style={styles.box} onPress={handleSelectStore}>
      <Ionicons name="storefront" size={20} color="#007bff" />

      <View style={styles.middleColumn}>
        <Text style={styles.label}>Tienda seleccionada</Text>

        {store ? (
          <>
            <Text style={styles.name}>{store.name}</Text>
            <Text style={styles.address}>{store.address}</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>Seleccionar tienda</Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#777"
        style={styles.chevron}
      />
    </TouchableOpacity>
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
  middleColumn: {
    marginLeft: 12,
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
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
});
