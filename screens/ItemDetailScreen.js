import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PrecioPromocion from "../components/PrecioPromocion";
import { defaultItem } from "../utils/defaultItem";
import { safeAlert } from "../utils/safeAlert";
import DebugBanner from "../components/DebugBanner"; // 👈 importación arriba

export default function ItemDetailScreen({ route, navigation }) {
  const { item = {}, onSave, onDelete } = route.params || {};
  const fullItem = { ...defaultItem, ...item };

  const [name, setName] = useState(fullItem.name);
  const [priceInfo, setPriceInfo] = useState(fullItem.priceInfo);
  const priceRef = useRef(fullItem.priceInfo);

  // ☰ Menú hamburguesa
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSave = async () => {
    //console.log(fullItem);
    //console.log(name);
    //console.log(priceInfo);
    const updatedItem = { ...fullItem, name, priceInfo };
    //console.log(updatedItem);
    await onSave(updatedItem);
    navigation.goBack();
  };

  const handleDelete = async () => {
    try {
      await onDelete(fullItem.id); // Espera a que la operación termine
      navigation.goBack(); // Luego vuelve atrás
    } catch (error) {
      console.error("Error eliminando el item:", error);
    }
  };

  // 💾 Guardar producto
  const handleSave1 = async () => {
    if (!name.trim()) {
      safeAlert("Nombre vacío", "Introduce un nombre para el producto.");
      return;
    }

    const updatedItem = {
      ...fullItem,
      name,
      priceInfo: priceRef.current, // ✅ última versión del hijo
    };

    try {
      await onSave(updatedItem);
      requestAnimationFrame(() => navigation.goBack());
    } catch (err) {
      console.error("Error al guardar item:", err);
      safeAlert("Error", "No se pudo guardar el producto.");
    }
  };

  // 🗑️ Eliminar producto
  const handleDelete1 = () => {
    safeAlert("Eliminar producto", "¿Seguro que deseas eliminarlo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await Promise.resolve(onDelete(fullItem.id));
            requestAnimationFrame(() => navigation.goBack());
          } catch (err) {
            console.error("Error al eliminar:", err);
            safeAlert("Error", "No se pudo eliminar el producto.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
      />

      <PrecioPromocion
        value={priceInfo}
        onChange={(newValue) => {
          setPriceInfo(newValue);
          priceRef.current = newValue;
        }}
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>💾 Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 6,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 6,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
