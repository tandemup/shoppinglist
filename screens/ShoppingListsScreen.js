import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllLists, createList } from "../utils/listStorage";
import { Ionicons } from "@expo/vector-icons";

export default function ShoppingListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState("");

  const loadLists = async () => {
    const data = await getAllLists();
    setLists(data.reverse());
  };
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [navigation]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createList(newName.trim());
    setNewName("");
    loadLists();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nueva lista..."
          placeholderTextColor="#999"
          value={newName}
          onChangeText={setNewName}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Añadir</Text>
        </TouchableOpacity>
      </View>
      {/* Mostrar todas las listas */}
      {lists.length === 0 ? (
        <Text style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
          No hay listas creadas todavía.
        </Text>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("ShoppingList", { listId: item.id })
              }
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>
                {item.createdAt
                  ? `${new Date(item.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}`
                  : ""}
                {item.storeName ? ` • ${item.storeName}` : ""}
              </Text>

              <Text style={styles.count}>{item.items.length} productos</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#E3F2FD", // 💙 Azul muy claro (Material Blue 50)
    padding: 14,
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
  name: { fontSize: 16, fontWeight: "bold" },
  date: { color: "#666", fontSize: 12 },
  count: { color: "#888", marginTop: 4 },
});
