import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useStore } from "../context/StoreContext";
import { getList } from "../utils/storage/listStorage";
import { safeAlert } from "../utils/safeAlert";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;

  const {
    updateListName,
    deleteList,
    archiveList,
    addItemsToHistory,
    fetchLists,
  } = useStore();

  const [list, setList] = useState(null);
  const [newItemText, setNewItemText] = useState("");

  //
  // 📌 Cargar lista actual
  //
  useEffect(() => {
    (async () => {
      const data = await getList(listId);
      setList(data);
    })();
  }, [listId]);

  // ⭐ Nueva lógica: modo solo lectura si está archivada
  const readOnly = list?.archived === true;

  //
  // ➕ Añadir item (bloqueado si archivada)
  //
  const handleAddItem = async () => {
    if (readOnly) return;

    if (!newItemText.trim()) return;

    const updated = {
      ...list,
      items: [
        ...list.items,
        {
          id: Date.now().toString(),
          name: newItemText.trim(),
          price: 0,
          checked: false,
        },
      ],
    };

    await updateListName(list.id, updated.name); // guardar
    setList(updated);
    setNewItemText("");
  };

  //
  // ☑️ Toggle checked (bloqueado si archivada)
  //
  const handleToggleChecked = async (itemId) => {
    if (readOnly) return;

    const updated = {
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    };

    await updateListName(list.id, updated.name);
    setList(updated);
  };

  //
  // 🗑 Borrar item (bloqueado si archivada)
  //
  const handleDeleteItem = async (itemId) => {
    if (readOnly) return;

    const updated = {
      ...list,
      items: list.items.filter((i) => i.id !== itemId),
    };

    await updateListName(list.id, updated.name);
    setList(updated);
  };

  //
  // ✏️ Editar item (bloqueado si archivada)
  //
  const handleEditItem = (item) => {
    if (readOnly) return;

    navigation.navigate("ItemDetailScreen", {
      item,
      listId: list.id,
    });
  };

  //
  // 📦 Archivar lista (bloqueado si archivada)
  //
  const handleArchiveList = () => {
    if (readOnly) return;

    safeAlert("Finalizar compra", "¿Has pagado esta compra?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Archivar",
        style: "destructive",
        onPress: async () => {
          await archiveList(list.id);
          await fetchLists();
          navigation.goBack();
        },
      },
    ]);
  };

  //
  // 🗑 Eliminar lista (bloqueado si archivada)
  //
  const handleDeleteList = () => {
    if (readOnly) return;

    safeAlert("Eliminar lista", `¿Seguro que deseas eliminar "${list.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteList(list.id);
          fetchLists();
          navigation.goBack();
        },
      },
    ]);
  };

  if (!list) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  //
  // 🎨 ITEM ROW (sin cambios de UI, solo bloqueo)
  //
  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleEditItem(item)}
      disabled={readOnly}
      style={[styles.itemRow, readOnly && { opacity: 0.4 }]}
    >
      <TouchableOpacity
        onPress={() => handleToggleChecked(item.id)}
        disabled={readOnly}
        style={styles.checkbox}
      >
        <Ionicons
          name={item.checked ? "checkbox" : "square-outline"}
          size={24}
          color={readOnly ? "#aaa" : "#007BFF"}
        />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.itemName,
            item.checked && {
              textDecorationLine: "line-through",
              color: "#999",
            },
          ]}
        >
          {item.name}
        </Text>

        <Text style={styles.itemPrice}>{item.price} €</Text>
      </View>

      {!readOnly && (
        <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
          <Ionicons name="trash" size={22} color="#CC0000" />
        </TouchableOpacity>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* ⭐ Banner mínimo, no cambia la UI */}
      {readOnly && (
        <View style={styles.archivedBanner}>
          <Text style={styles.archivedText}>
            LISTA ARCHIVADA – SOLO LECTURA
          </Text>
        </View>
      )}

      <Text style={styles.title}>{list.name}</Text>

      {/* ➕ Añadir item (oculto si archivada) */}
      {!readOnly && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nuevo producto..."
            placeholderTextColor="#999"
            value={newItemText}
            onChangeText={setNewItemText}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA DE ITEMS */}
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* BOTONES DE PIE – mismos que tu UI original */}
      {!readOnly && (
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#007BFF" }]}
            onPress={handleArchiveList}
          >
            <Text style={styles.footerBtnText}>Archivar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, { backgroundColor: "#CC0000" }]}
            onPress={handleDeleteList}
          >
            <Text style={styles.footerBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

//
// 🎨 ESTILOS (los tuyos, intactos)
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  archivedBanner: {
    backgroundColor: "#B00020",
    padding: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  archivedText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
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
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 12,
    color: "#007BFF",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  footerBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  footerBtnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
