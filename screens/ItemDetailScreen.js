// screens/ItemDetailScreen.js
import React, { useState, useEffect } from "react";
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

export default function ItemDetailScreen({ route, navigation }) {
  const { item, onSave, onDelete } = route.params;

  // 🧊 Congelar ID original del item
  const originalId = item.id;

  // ⭐ Estado único y consistente (AÑADIMOS barcode y aiData)
  const [itemData, setItemData] = useState({
    ...defaultItem,
    barcode: "",
    aiData: null,
    ...item,
    id: originalId,
  });

  //
  // ☰ Menú (hamburguesa)
  //
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

  //
  // 💾 Guardar
  //
  const handleSave = async () => {
    if (!itemData.name.trim()) {
      safeAlert("Nombre vacío", "Introduce un nombre para el producto.");
      return;
    }

    const updatedItem = {
      ...itemData,
      id: originalId,
    };

    try {
      await onSave(updatedItem);

      // Volver a la lista
      requestAnimationFrame(() => navigation.goBack());
    } catch (err) {
      console.error(err);
      safeAlert("Error", "No se pudo guardar.");
    }
  };

  //
  // 🗑 Eliminar
  //
  const handleDelete = () => {
    safeAlert("Eliminar producto", "¿Seguro que deseas eliminarlo?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await Promise.resolve(onDelete(originalId));
            requestAnimationFrame(() => navigation.goBack());
          } catch (err) {
            console.error(err);
            safeAlert("Error", "No se pudo eliminar.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ⭐ NUEVO — Código de barras */}
      {itemData.barcode ? (
        <>
          <Text style={styles.label}>Código de barras</Text>
          <View style={styles.nonEditableBox}>
            <Text style={styles.nonEditableText}>{itemData.barcode}</Text>
          </View>
        </>
      ) : null}

      {/* ⭐ NUEVO — Datos generados por ChatGPT */}
      {itemData.aiData ? (
        <>
          <Text style={styles.label}>Datos generados por IA</Text>
          <View style={styles.aiBox}>
            <Text style={styles.aiText}>
              {itemData.aiData.description ??
                JSON.stringify(itemData.aiData, null, 2)}
            </Text>
          </View>
        </>
      ) : null}

      {/* Nombre */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={itemData.name}
        onChangeText={(text) =>
          setItemData((prev) => ({ ...prev, name: text }))
        }
      />

      {/* Precio y promociones */}
      <PrecioPromocion
        value={itemData.priceInfo}
        onChange={(info) =>
          setItemData((prev) => ({
            ...prev,
            priceInfo: {
              ...info,
              total: parseFloat(info.total) || 0,
              qty: parseFloat(info.qty) || 1,
              unitPrice: parseFloat(info.unitPrice) || 0,
            },
          }))
        }
      />

      {/* Botones */}
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

//
// 🎨 Estilos
//
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

  // ⭐ NUEVO — Caja no editable
  nonEditableBox: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 16,
  },
  nonEditableText: {
    fontSize: 16,
    color: "#555",
  },

  // ⭐ NUEVO — Caja IA
  aiBox: {
    padding: 12,
    backgroundColor: "#f3f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c7ddff",
    marginBottom: 16,
  },
  aiText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
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
