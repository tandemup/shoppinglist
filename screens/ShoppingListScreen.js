import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState, useCallback } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { getList, updateList } from "../utils/storage/listStorage";
import { defaultItem } from "../utils/defaultItem";

import StoreSelector from "../components/StoreSelector";
import SearchCombinedBar from "../components/SearchCombinedBar";
import ItemRow from "../components/ItemRow";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  //
  // ☰ ICONO HAMBURGUESA
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
  // 🔄 CARGAR LISTA
  //
  const loadList = useCallback(async () => {
    const data = await getList(listId);
    if (data) {
      setList(data);
      navigation.setOptions({ title: data.name });
    }
  }, [listId]);

  useEffect(() => {
    loadList();
    const unsub = navigation.addListener("focus", loadList);
    return unsub;
  }, [navigation, loadList]);

  //
  // ➕ AÑADIR ITEM NUEVO
  //
  const addItem = async () => {
    if (!nuevoItem.trim()) return;

    const newItem = {
      ...defaultItem,
      id: uuidv4(),
      name: nuevoItem.trim(),
      checked: true, // <<< CORREGIDO
      priceInfo: { total: 0, unitPrice: 0, qty: 1 }, // <<< CORREGIDO
    };

    await updateList(listId, (prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem], // <<< NO ORDENAR, RESPETAR INSERCIÓN
    }));

    setNuevoItem("");
    loadList();
  };

  //
  // ☑ TOGGLE CHECKED
  //
  const toggleChecked = async (id) => {
    await updateList(listId, (prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));

    loadList();
  };

  //
  // ✏️ ABRIR DETALLE
  //
  const openItemDetail = (item) => {
    navigation.navigate("ItemDetailScreen", {
      item,

      onSave: async (updated) => {
        await updateList(listId, (prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
        }));
      },

      onDelete: async (id) => {
        await updateList(listId, (prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== id),
        }));
      },
    });
  };

  //
  // 💶 TOTAL (solo suma marcados)
  //
  const total = (() => {
    if (!list?.items) return "0.00";

    return list.items
      .filter((i) => i.checked)
      .reduce((acc, item) => {
        const p = item.priceInfo || {};
        return acc + (parseFloat(p.total) || 0);
      }, 0)
      .toFixed(2);
  })();

  //
  // RENDER ITEM (usamos ItemRow.js)
  //
  const renderItem = ({ item }) => (
    <ItemRow item={item} onToggle={toggleChecked} onEdit={openItemDetail} />
  );

  //
  // LOADING
  //
  if (!list) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  //
  // UI FINAL
  //
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StoreSelector navigation={navigation} />

        <SearchCombinedBar currentList={list} onSelectHistoryItem={() => {}} />

        {/* TOTAL */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{total} €</Text>
        </View>

        {/* AÑADIR */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.newInput}
            placeholder="Añadir producto..."
            placeholderTextColor="#999"
            value={nuevoItem}
            onChangeText={setNuevoItem}
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={addItem}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA → SIN ORDENAR */}
        <FlatList
          data={list.items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 20, fontWeight: "600" },
  totalValue: { fontSize: 30, fontWeight: "800" },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  newInput: {
    flex: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
});
