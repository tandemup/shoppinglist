// screens/ShoppingListsScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadLists, addList, deleteList } from "../utils/storage/listStorage";

export default function ShoppingListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");

  // 📌 Cargar listas al iniciar
  const fetchLists = useCallback(async () => {
    const data = await loadLists();
    setLists(data);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchLists);
    return unsubscribe;
  }, [navigation, fetchLists]);

  // ➕ Crear una nueva lista
  const handleAddList = async () => {
    if (!newListName.trim()) return;

    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      createdAt: new Date().toISOString(),
      items: [],
    };

    await addList(newList);
    setNewListName("");
    fetchLists();
  };

  // 🗑 Eliminar una lista
  const handleDeleteList = async (id) => {
    await deleteList(id);
    fetchLists();
  };

  // 🧭 Navegar a una lista específica
  const handleOpenList = (list) => {
    navigation.navigate("ShoppingList", { listId: list.id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleOpenList(item)}
      onLongPress={() => handleDeleteList(item.id)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.date}>
        Creada el {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.count}>{item.items?.length || 0} productos</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Listas</Text>

      {/* Crear nueva lista */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva lista..."
          placeholderTextColor="#999"
          value={newListName}
          onChangeText={setNewListName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddList}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Listado */}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
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
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: "#007BFF",
    width: 45,
    height: 45,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#BBDEFB",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    color: "#666",
    fontSize: 12,
  },
  count: {
    color: "#888",
    marginTop: 4,
  },
});
