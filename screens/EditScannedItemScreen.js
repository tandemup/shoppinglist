// screens/EditScannedItemScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { updateScannedEntry } from "../utils/storage/scannerHistory";

export default function EditScannedItemScreen({ route, navigation }) {
  const { item } = route.params;

  const [name, setName] = useState(item.name ?? "");
  const [brand, setBrand] = useState(item.brand ?? "");
  const [url, setUrl] = useState(item.url ?? "");

  const save = async () => {
    await updateScannedEntry(item.code, {
      name: name.trim(),
      brand: brand.trim(),
      url: url.trim(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar producto</Text>

      {/* ⭐ NUEVO: Código de barras (solo lectura) */}
      <Text style={styles.label}>Código de barras</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{item.code}</Text>
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

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
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
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
  },

  // ⭐ NUEVO: estilo caja de código
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
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 30,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
