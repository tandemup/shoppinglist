import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { safeAlert } from "../utils/core/safeAlert";
import { useLists } from "../context/ListsContext";

export default function ShoppingListsScreen() {
  const navigation = useNavigation();

  /* =====================================================
     Estado global (LISTAS)
  ===================================================== */
  const { lists = [], createList, deleteList } = useLists();
  const [name, setName] = useState("");

  /* =====================================================
     Header
  ===================================================== */
  useEffect(() => {
    navigation.setOptions({
      title: "Listas de la compra",
      headerTitleAlign: "center",
      headerShadowVisible: true,
    });
  }, [navigation]);

  /* =====================================================
     Crear nueva lista
  ===================================================== */
  const handleAddList = () => {
    if (!name.trim()) return;
    createList(name.trim());
    setName("");
  };

  /* =====================================================
     Abrir lista
  ===================================================== */
  const handleOpenList = (listId) => {
    navigation.navigate("ShoppingList", { listId });
  };

  /* =====================================================
     Menú contextual
  ===================================================== */
  const openContextMenu = (list) => {
    safeAlert("Opciones de la lista", `¿Qué deseas hacer con "${list.name}"?`, [
      {
        text: "Archivar",
        onPress: () => {
          // si más adelante añades archived:true en ListsContext
          // aquí iría la lógica de archivado
          console.log("Archivar lista", list.id);
        },
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteList(list.id),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ]);
  };

  /* =====================================================
     Render item (tarjeta)
  ===================================================== */
  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleOpenList(item.id)}>
      {/* Fila superior: nombre + menú */}
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>

        <Pressable onPress={() => openContextMenu(item)} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={20} color="#555" />
        </Pressable>
      </View>

      <Text style={styles.date}>
        Creada el {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      <Text style={styles.count}>{item.items?.length || 0} productos</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Listas</Text>

      {/* -------- Nueva lista -------- */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva lista..."
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <Pressable style={styles.addButton} onPress={handleAddList}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* -------- Listado -------- */}
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
        }
      />
    </SafeAreaView>
  );
}

/* =====================================================
   🎨 ESTILOS (layout de la captura)
===================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    color: "#000",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 16,
  },
  addButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFD7FF",
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
  },
  count: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
  },
});
