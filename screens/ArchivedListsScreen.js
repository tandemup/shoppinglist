import React, { useEffect } from "react";
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

  //
  // 🍔 MENÚ HAMBURGUESA
  //
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //
  // 🔄 RECARGAR AL ENTRAR
  //
  useEffect(() => {
    fetchLists();
  }, []);

  //
  // ⭐ Solo listas archivadas
  //
  const archivedLists = lists
    .filter((l) => l.archived)
    .sort((a, b) => b.archivedAt - a.archivedAt);

  //
  // 🚪 ABRIR LISTA ARCHIVADA (solo lectura)
  //
  const handleOpenList = (list) => {
    navigation.navigate("ShoppingList", { listId: list.id });
  };

  //
  // 🗑 BORRAR LISTA ARCHIVADA (long press)
  //
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

  //
  // 🎨 RENDER ITEM
  //
  const renderItem = ({ item }) => (
    <Pressable
      style={[styles.card, { opacity: 0.55 }]}
      onPress={() => handleOpenList(item)}
      onLongPress={() => handleDeleteList(item)}
      delayLongPress={350}
    >
      <Text style={styles.name}>{item.name}</Text>

      <Text style={styles.date}>
        Archivada el{" "}
        {item.archivedAt
          ? new Date(item.archivedAt).toLocaleDateString("es-ES")
          : "—"}
      </Text>

      <Text style={styles.count}>{item.items?.length || 0} productos</Text>

      {/* Icono de candado */}
      <View style={styles.lock}>
        <Ionicons name="lock-closed" size={20} color="#B00020" />
      </View>
    </Pressable>
  );

  //
  // 🖥 RENDER PRINCIPAL
  //
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
    textAlign: "center",
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
