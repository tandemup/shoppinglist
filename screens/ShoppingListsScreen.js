import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { ROUTES } from "../navigation/ROUTES";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";
import { useStore } from "../context/StoreContext";
import { generateId } from "../utils/generateId";

export default function ShoppingListsScreen({ navigation }) {
  const store = useStore() || {};
  const { lists = [], addList, deleteList, archiveList } = store;
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "center",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.MENU)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddList = async () => {
    if (!newListName.trim()) return;

    const newList = {
      id: generateId(),
      name: newListName.trim(),
      createdAt: new Date().toISOString(),
      items: [],
      archived: false,
    };

    await addList(newList);
    setNewListName("");
  };

  const handleOpenList = (list) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId: list.id });
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => handleOpenList(item)}
      onLongPress={() => {
        safeAlert(
          "Opciones de la lista",
          `¿Qué deseas hacer con "${item.name}"?`,
          [
            { text: "Cancelar", style: "cancel" },

            {
              text: "Archivar",
              onPress: async () => {
                await archiveList(item.id);
              },
            },

            {
              text: "Eliminar",
              style: "destructive",
              onPress: async () => {
                await deleteList(item.id);
              },
            },
          ]
        );
      }}
      delayLongPress={400}
    >
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.date}>
        Creada el {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      <Text style={styles.count}>{item.items?.length || 0} productos</Text>
    </Pressable>
  );

  //
  // 🎯 MOSTRAR SOLO LISTAS ACTIVAS (NO ARCHIVADAS)
  //
  const activeLists = lists.filter((l) => !l.archived);

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
        data={activeLists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30, color: "#888" }}>
            No tienes listas activas 😊
          </Text>
        }
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
    elevation: 1,
  },
  card1: {
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
