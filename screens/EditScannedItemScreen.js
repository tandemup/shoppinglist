// screens/EditScannedItemScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  updateScannedEntry,
  removeScannedItem,
} from "../services/scannerHistory";

import { safeAlert } from "../utils/core/safeAlert";

export default function EditScannedItemScreen({ route, navigation }) {
  const { item, reload } = route.params;

  const barcode = item.barcode;

  const [name, setName] = useState(item.name ?? "");
  const [brand, setBrand] = useState(item.brand ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [notes, setNotes] = useState(item.notes || "");

  //
  // 💾 Guardar cambios
  //
  const save = async () => {
    await updateScannedEntry(barcode, {
      ...item,
      name: name.trim(),
      brand: brand.trim(),
      url: url.trim(),
      barcode,
      imageUrl,
      notes,
    });

    if (reload) reload();
    navigation.goBack();
  };

  //
  // 🗑 Borrar este item
  //
  const removeItem = () => {
    console.log("removeItem");
    safeAlert("Eliminar", `¿Deseas eliminar este escaneo?\n\n${item.name}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          console.log("onPress");
          await removeScannedItem(barcode); // ✔ corregido
          console.log("reload");
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* IMAGEN */}
        <Text style={styles.label}>Imagen del producto</Text>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
        ) : (
          <View
            style={{
              width: 120,
              height: 120,
              backgroundColor: "#ddd",
              borderRadius: 8,
              marginBottom: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#666" }}>Sin imagen</Text>
          </View>
        )}

        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="URL de la imagen"
          style={styles.input}
        />

        {/* NOTAS */}
        <Text style={styles.label}>Notas</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Añade una descripción o notas"
          multiline
          style={[styles.input, { height: 80 }]}
        />

        {/* BOTÓN GUARDAR */}
        <Pressable style={styles.saveButton} onPress={save}>
          <Text style={styles.saveText}>Guardar cambios</Text>
        </Pressable>

        {/* BOTÓN BORRAR */}
        <Pressable style={styles.deleteButton} onPress={removeItem}>
          <Text style={styles.deleteText}>Borrar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
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
