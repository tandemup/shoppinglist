import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ROUTES } from "../navigation/ROUTES";
import { safeAlert } from "../utils/core/safeAlert";
import { useStore } from "../context/StoreContext";
import { generateId } from "../utils/core/generateId";

export default function ShoppingListsScreen({ navigation }) {
  const { lists = [], addList, deleteList, archiveList } = useStore();

  const [newListName, setNewListName] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "center",
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate(ROUTES.MENU)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </Pressable>
      ),
    });
  }, [navigation]);

  // ────────────────────────────────────────────────
  // ACCIONES
  // ────────────────────────────────────────────────
  const handleAddList = async () => {
    if (!newListName.trim()) {
      safeAlert(
        "Nombre vacío",
        "Escribe un nombre para la lista antes de crearla."
      );
      return;
    }

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
    navigation.navigate(ROUTES.SHOPPING_LIST, {
      listId: list.id,
    });
  };

  const handleListMenu = (list) => {
    setSelectedList(list);
    setMenuVisible(true);
  };

  // ────────────────────────────────────────────────
  // RENDER ITEM
  // ────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => handleOpenList(item)}>
      <View style={styles.cardRow}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>{item.items.length} productos</Text>
        </View>

        <Pressable hitSlop={10} onPress={() => handleListMenu(item)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </Pressable>
      </View>
    </Pressable>
  );

  // ────────────────────────────────────────────────
  // SOLO LISTAS ACTIVAS
  // ────────────────────────────────────────────────
  const activeLists = lists.filter((l) => !l.archived);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Listas</Text>

      {/* NUEVA LISTA */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva lista..."
          placeholderTextColor="#999"
          returnKeyType="done"
          blurOnSubmit
          value={newListName}
          onChangeText={setNewListName}
        />
        <Pressable style={styles.addButton} onPress={handleAddList}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      {/* LISTADO */}
      <FlatList
        data={activeLists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
        }
      />

      {/* MENÚ EMERGENTE */}
      {selectedList && (
        <Modal
          transparent
          animationType="fade"
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.menuContainer}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate(ROUTES.EDIT_LIST, {
                  listId: selectedList.id,
                });
              }}
            >
              <Text style={styles.menuText}>✏️ Editar</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                archiveList(selectedList.id);
              }}
            >
              <Text style={[styles.menuText, styles.warning]}>📦 Archivar</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                deleteList(selectedList.id);
              }}
            >
              <Text style={[styles.menuText, styles.danger]}>🗑️ Borrar</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, styles.cancel]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuText}>Cancelar</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────
// 🎨 ESTILOS
// ────────────────────────────────────────────────
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
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardMeta: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
  },

  // MENÚ
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    right: 20,
    top: 120,
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
  },
  danger: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  warning: {
    color: "#d97706",
  },
  cancel: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
});
