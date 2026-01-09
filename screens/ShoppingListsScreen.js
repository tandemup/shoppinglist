import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Pressable,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation } from "@react-navigation/native";
import { safeAlert } from "../utils/core/safeAlert";
import { useLists } from "../context/ListsContext";
import { ROUTES } from "../navigation/ROUTES";

export default function ShoppingListsScreen() {
  const navigation = useNavigation();

  /* =====================================================
     Estado global (LISTAS)
  ===================================================== */
  const { activeLists = [], createList, deleteList, archiveList } = useLists();

  const [name, setName] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  /* =====================================================
     Header
  ===================================================== */

  useEffect(() => {
    navigation.setOptions({
      title: "Shopping Lists",
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
     Abrir lista (defensivo)
  ===================================================== */
  const handleOpenList = (listId) => {
    if (!activeLists.find((l) => l.id === listId)) return;
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId });
  };

  /* =====================================================
     Menú contextual
  ===================================================== */
  const openContextMenu = (list, event) => {
    if (Platform.OS === "web") {
      if (!event?.currentTarget) return;

      const rect = event.currentTarget.getBoundingClientRect();

      setContextMenu({
        list,
        x: rect.right - 160, // ancho aprox del menú
        y: rect.bottom + 6,
      });
    } else {
      safeAlert(
        "Opciones de la lista",
        `¿Qué deseas hacer con "${list.name}"?`,
        [
          {
            text: "Archivar",
            onPress: () => {
              archiveList(list.id);
              navigation.navigate(ROUTES.ARCHIVED_LISTS);
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
        ]
      );
    }
  };

  /* =====================================================
     Render item (tarjeta)
  ===================================================== */
  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleOpenList(item.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>

        <Pressable onPress={(e) => openContextMenu(item, e)} hitSlop={8}>
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
          <Entypo name="add-to-list" size={24} color="green" />
        </Pressable>
      </View>

      {/* -------- Listado -------- */}
      <FlatList
        data={activeLists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
        }
      />

      {/* -------- Menú contextual Web -------- */}
      {contextMenu && Platform.OS === "web" && (
        <Pressable style={styles.overlay} onPress={() => setContextMenu(null)}>
          <View
            style={[
              styles.contextMenu,
              {
                top: contextMenu.y,
                left: contextMenu.x,
              },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                archiveList(contextMenu.list.id);
                setContextMenu(null);
                navigation.navigate(ROUTES.ARCHIVED_LISTS);
              }}
            >
              <Text style={styles.menuText}>Archivar</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                deleteList(contextMenu.list.id);
                setContextMenu(null);
              }}
            >
              <Text style={[styles.menuText, { color: "#dc2626" }]}>
                Eliminar
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => setContextMenu(null)}
            >
              <Text style={styles.menuText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

/* =====================================================
   🎨 ESTILOS
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
    borderWidth: "thin",
    borderColor: "green",
    backgroundColor: "clear",
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

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  contextMenu: {
    position: "fixed", // Web
    backgroundColor: "#fff",
    borderRadius: 10,
    minWidth: 160,
    paddingVertical: 6,
    zIndex: 1000,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },

  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  menuText: {
    fontSize: 15,
    color: "#111",
  },
});
