// components/StoreSelector.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  loadSelectedStore,
  saveSelectedStore,
  clearSelectedStore,
} from "../utils/storage/storeService";

export default function StoreSelector({ navigation }) {
  const [store, setStore] = useState(null);

  useEffect(() => {
    loadSelectedStore().then((s) => {
      if (s) setStore(s);
    });
  }, []);

  const handleSelectStore = () => {
    navigation.navigate("StoresScreen", {
      onSelectStore: async (selected) => {
        setStore(selected);
        await saveSelectedStore(selected);
      },
    });
  };

  return (
    <TouchableOpacity style={styles.box} onPress={handleSelectStore}>
      <Ionicons name="storefront" size={20} color="#007bff" />

      {/* ESTE ERA inline:  marginLeft: 12, flex: 1 */}
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

      {/* ESTE ERA inline: marginLeft: "auto" */}
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
    marginHorizontal: 0,
  },

  // ⬅ NUEVO: reemplaza <View style={{ marginLeft:12, flex:1 }}>
  middleColumn: {
    marginLeft: 12,
    flex: 1,
  },

  // ⬅ NUEVO: reemplaza style={{ marginLeft:"auto" }}
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
