import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { ROUTES } from "../navigation/ROUTES";

export default function ShoppingListsScreen() {
  const navigation = useNavigation();
  const { lists, createList } = useLists();

  const [name, setName] = useState("");

  /* ---------------------------
     Crear nueva lista
  ----------------------------*/
  const handleAddList = () => {
    if (!name.trim()) return;

    createList(name.trim());
    setName("");
  };

  /* ---------------------------
     Abrir lista
  ----------------------------*/
  const handleOpenList = (listId) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, {
      listId,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mis Listas</Text>

      {/* -------- Nueva lista -------- */}
      <View style={styles.newListRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la lista"
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={handleAddList}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* -------- Listas -------- */}
      {lists.length === 0 && (
        <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
      )}

      {lists.map((list) => (
        <Pressable
          key={list.id}
          style={styles.listRow}
          onPress={() => handleOpenList(list.id)}
        >
          <Text style={styles.listName}>{list.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
  },
  newListRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
  },
  listRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#666",
  },
});
