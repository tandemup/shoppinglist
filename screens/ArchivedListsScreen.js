import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useStore } from "../context/StoreContext";
import { safeAlert } from "../utils/safeAlert";

export default function ArchivedListsScreen({ navigation }) {
  const { lists, deleteList, fetchLists } = useStore();

  // ⭐ Solo listas archivadas
  const archivedLists = lists
    .filter((l) => l.archived)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleOpenList = (list) => {
    navigation.navigate("ShoppingList", { listId: list.id });
  };

  const handleDeleteList = (list) => {
    safeAlert("Eliminar lista", `¿Seguro que deseas eliminar "${list.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteList(list.id);
          await fetchLists();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={[styles.card, { opacity: 0.55 }]}
      onPress={() => handleOpenList(item)}
      onLongPress={() => handleDeleteList(item)}
      delayLongPress={350}
    >
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.date}>
        Archivada el {new Date(item.archivedAt).toLocaleDateString()}
      </Text>

      <Text style={styles.count}>{item.items?.length || 0} productos</Text>

      <View style={styles.lock}>
        <Ionicons name="lock-closed" size={20} color="#B00020" />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Listas Archivadas</Text>

      <FlatList
        data={archivedLists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay listas archivadas</Text>
        }
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}

//
// 🎨 ESTILOS (coherentes con tus pantallas actuales)
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
  empty: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",

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
  lock: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
