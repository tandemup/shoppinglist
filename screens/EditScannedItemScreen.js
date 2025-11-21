import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { updateScannedProduct } from "../utils/storageHelpers";

export default function EditScannedItemScreen({ route, navigation }) {
  const { item } = route.params;

  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand);
  const [url, setUrl] = useState(item.url);

  const save = async () => {
    await updateScannedProduct(item.id, {
      name,
      brand,
      url,
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 20 }}>
      <Text style={{ color: "white", fontSize: 18 }}>Editar producto</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
        placeholderTextColor="#666"
        style={styles.input}
      />

      <TextInput
        value={brand}
        onChangeText={setBrand}
        placeholder="Marca"
        placeholderTextColor="#666"
        style={styles.input}
      />

      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="URL"
        placeholderTextColor="#666"
        style={styles.input}
      />

      <Pressable onPress={save} style={styles.button}>
        <Text style={styles.buttonText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  input: {
    backgroundColor: "#222",
    color: "white",
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
};
