// screens/ShoppingListScreen.js
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getList, updateList } from "../utils/storage/listStorage";

export default function ShoppingListScreen({ route }) {
  const { listId } = route.params;

  const [list, setList] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  //
  // 🔄 Cargar la lista
  //
  const loadListData = useCallback(async () => {
    const data = await getList(listId);
    setList(data);
  }, [listId]);

  useEffect(() => {
    loadListData();
  }, [loadListData]);

  //
  // ➕ Añadir nuevo producto a la lista
  //
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    await updateList(listId, (original) => {
      const updatedItems = [
        ...(original.items || []),
        {
          id: uuidv4(),
          name: newItemName.trim(),
          completed: false,
        },
      ];

      return {
        ...original,
        items: updatedItems,
      };
    });

    setNewItemName("");
    loadListData();
  };

  //
  // ☑ Marcar producto como completado
  //
  const toggleItem = async (itemId) => {
    await updateList(listId, (original) => {
      const updatedItems = original.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      return {
        ...original,
        items: updatedItems,
      };
    });

    loadListData();
  };

  //
  // 🗑 Eliminar producto de la lista
  //
  const deleteItem = async (itemId) => {
    await updateList(listId, (original) => {
      const updatedItems = original.items.filter((item) => item.id !== itemId);

      return {
        ...original,
        items: updatedItems,
      };
    });

    loadListData();
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={styles.itemLeft}
        onPress={() => toggleItem(item.id)}
      >
        <Ionicons
          name={item.completed ? "checkbox" : "square-outline"}
          size={24}
          color={item.completed ? "#4CAF50" : "#555"}
        />

        <Text style={[styles.itemName, item.completed && styles.completedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Ionicons name="trash" size={22} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  if (!list) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>{list.name}</Text>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* ➕ Añadir producto */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Añadir producto..."
          value={newItemName}
          onChangeText={setNewItemName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },

  // 🔸 Items
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    marginLeft: 10,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#777",
  },

  // ➕ Add product row
  addRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});
