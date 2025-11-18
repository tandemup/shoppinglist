// screens/ShoppingListScreen.js
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  getAllLists,
  updateList,
  addItemToList,
  updateItemInList,
  deleteItemFromList,
} from "../utils/listStorage";

import ItemRow from "../components/ItemRow";
import SearchCombinedBar from "../components/SearchCombinedBar";
import StoreSelector from "../components/StoreSelector";
import { safeAlert } from "../utils/safeAlert";
import { defaultItem } from "../utils/defaultItem";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params || {};

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  const storeRef = useRef(null);

  // -------------------------
  // CARGAR LISTA
  // -------------------------
  const loadList = useCallback(async () => {
    try {
      const lists = await getAllLists();
      const found = lists.find((l) => l.id === listId);

      if (!found) {
        safeAlert("Error", "No se encontró la lista.");
        navigation.goBack();
        return;
      }

      setList(found);
    } catch (err) {
      console.error("Error cargando lista:", err);
    }
  }, [listId, navigation]);

  useEffect(() => {
    loadList();
    const unsubscribe = navigation.addListener("focus", loadList);
    return unsubscribe;
  }, [navigation, loadList]);

  // -------------------------
  // HEADER
  // -------------------------
  useEffect(() => {
    if (list?.name) navigation.setOptions({ title: list.name });
  }, [list?.name, navigation]);

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

  // -------------------------
  // AÑADIR ITEM NUEVO
  // -------------------------
  const addItem = async () => {
    if (!nuevoItem.trim() || !list) return;

    const formattedDate = new Date().toISOString().substring(0, 10);

    const newItem = {
      ...defaultItem,
      id: uuidv4(),
      name: nuevoItem.trim(),
      date: formattedDate,
      checked: true,
    };

    // Guardar en almacenamiento
    await addItemToList(listId, newItem);

    // Actualizar UI
    setList((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));

    setNuevoItem("");
  };

  // -------------------------
  // CHECK/UNCHECK ITEM
  // -------------------------
  const toggleChecked = useCallback(
    async (id) => {
      if (!list) return;

      const item = list.items.find((i) => i.id === id);
      if (!item) return;

      const updatedItem = {
        ...item,
        checked: !item.checked,
      };

      // Guardar
      await updateItemInList(listId, updatedItem);

      // Actualizar UI
      setList((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === id ? updatedItem : i)),
      }));
    },
    [list, listId]
  );

  // -------------------------
  // ABRIR DETALLE
  // -------------------------
  const openItemDetail = (item) => {
    navigation.navigate("ItemDetailScreen", {
      item,

      // Guardar cambios
      onSave: async (updatedItem) => {
        await updateItemInList(listId, updatedItem);

        setList((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.id === updatedItem.id ? updatedItem : i
          ),
        }));
      },

      // Eliminar item
      onDelete: async (id) => {
        await deleteItemFromList(listId, id);

        setList((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== id),
        }));
      },
    });
  };

  // -------------------------
  // TOTAL
  // -------------------------
  const total = (() => {
    if (!list?.items?.length) return "0.00";

    const sum = list.items
      .filter((i) => i.checked)
      .reduce((acc, i) => {
        const p = i.priceInfo || {};
        const subtotal =
          p.total ?? parseFloat(p.unitPrice || 0) * parseFloat(p.qty || 1);

        return acc + (isNaN(subtotal) ? 0 : subtotal);
      }, 0);

    return sum.toFixed(2);
  })();

  const renderItem = ({ item }) => (
    <ItemRow item={item} onToggle={toggleChecked} onEdit={openItemDetail} />
  );

  if (!list) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>
          Cargando lista...
        </Text>
      </View>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, marginTop: 1 }}
      >
        {/* Selector de tienda */}
        <StoreSelector navigation={navigation} />

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{total} €</Text>
        </View>

        {/* Historial */}
        <SearchCombinedBar
          currentList={list}
          onSelectHistoryItem={async (historyItem) => {
            const item = {
              ...historyItem.item,
              id: historyItem.item.id,
              checked: false,
            };

            await addItemToList(listId, item);

            setList((prev) => ({
              ...prev,
              items: [item, ...prev.items],
            }));
          }}
        />

        {/* Añadir */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.newInput}
            placeholder="Añadir producto..."
            placeholderTextColor="#999"
            value={nuevoItem}
            onChangeText={setNuevoItem}
            onSubmitEditing={addItem}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={list.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    borderColor: "#BBDEFB",
  },
  totalLabel: { fontSize: 20, fontWeight: "600" },
  totalValue: { fontSize: 30, fontWeight: "800" },

  addRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 5 },
  newInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
