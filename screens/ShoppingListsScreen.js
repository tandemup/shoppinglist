// screens/ShoppingListsScreen.js
import React, { useEffect, useState } from "react";
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

import { getAllLists, createList } from "../utils/listStorage";
import { Ionicons } from "@expo/vector-icons";

export default function ShoppingListsScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [newName, setNewName] = useState("");

  const loadLists = async () => {
    const data = await getAllLists();
    setLists(data.reverse());
  };

  // Botón de menú superior
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

  // Recargar al volver a la pantalla
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
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === "web" ? 0 : undefined,
        backgroundColor: "#fff",
      }}
      edges={Platform.OS === "web" ? [] : ["top"]}
    >
      <View style={{ flex: 1 }}>
        {/* Input + botón Añadir */}
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

        {/* Listas */}
        {lists.length === 0 ? (
          <Text style={styles.emptyMsg}>No hay listas creadas todavía.</Text>
        ) : (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 0,
  },
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
  emptyMsg: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#E3F2FD",
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BBDEFB",

    // Sombra Mobile + Web compatible
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
