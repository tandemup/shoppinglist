// screens/EditScannedItemScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import {
  updateScannedEntry,
  removeScannedItem,
} from "../utils/storage/scannerHistory";
import { safeAlert } from "../utils/safeAlert";

export default function EditScannedItemScreen({ route, navigation }) {
  const { item, reload } = route.params;

  const barcode = item.barcode;

  const [name, setName] = useState(item.name ?? "");
  const [brand, setBrand] = useState(item.brand ?? "");
  const [url, setUrl] = useState(item.url ?? "");

  //
  // 💾 Guardar cambios
  //
  const save = async () => {
    await updateScannedEntry(barcode, {
      name: name.trim(),
      brand: brand.trim(),
      url: url.trim(),
    });
    if (reload) reload();
    navigation.goBack();
  };

  //
  // 🗑 Borrar este item
  //
  const removeItem = () => {
    safeAlert("Eliminar", `¿Deseas eliminar este escaneo?\n\n${item.name}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeScannedItem(item.id);

          if (reload) reload();
          navigation.goBack();
        },
      },
    ]);
  };

  //
  // UI
  //
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar producto</Text>

      <Text style={styles.label}>Código de barras</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{barcode}</Text>
      </View>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
      />

      <Text style={styles.label}>Marca</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="Marca"
      />

      <Text style={styles.label}>URL</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="URL del producto"
        autoCapitalize="none"
      />

      {/* 💾 GUARDAR */}
      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveText}>Guardar cambios</Text>
      </Pressable>

      {/* 🗑 BORRAR */}
      <Pressable style={styles.deleteButton} onPress={removeItem}>
        <Text style={styles.deleteText}>Borrar</Text>
      </Pressable>
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
  },

  codeBox: {
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#aabbee",
  },
  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 30,
    borderRadius: 6,
  },
  saveText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 12,
    marginTop: 15,
    borderRadius: 6,
  },
  deleteText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
