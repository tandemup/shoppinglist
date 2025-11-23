// screens/ShoppingListScreen.js
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
    console.log("DEBUG listId:", listId);
    //console.log("DEBUG loadLists():", await loadLists());
    console.log("LISTA CARGADA:", data, "ID:", listId);
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
      checked: false, // corregido
      priceInfo: { total: 0, unitPrice: 0, qty: 1 },
    };

    await updateList(listId, (prev) => ({
      ...prev,
      items: [newItem, ...(prev.items || [])],
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
  // 💶 TOTAL
  //
  const total = (() => {
    if (!list?.items) return "0.00";

    return list.items
      .filter((i) => !i.checked)
      .reduce((acc, item) => {
        const p = item.priceInfo || {};
        const subtotal = parseFloat(p.total) || 0;
        return acc + subtotal;
      }, 0)
      .toFixed(2);
  })();

  //
  // ORDENAR: no marcados arriba
  //
  const sortedItems = [...(list?.items || [])].sort((a, b) => {
    if (a.checked === b.checked) return 0;
    return a.checked ? 1 : -1;
  });

  //
  // RENDER ITEM
  //
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <TouchableOpacity
        style={styles.itemLeft}
        onPress={() => toggleChecked(item.id)}
      >
        <Ionicons
          name={item.checked ? "checkbox" : "square-outline"}
          size={26}
          color={item.checked ? "#4CAF50" : "#555"}
        />
        <Text
          style={[
            styles.itemName,
            item.checked && {
              textDecorationLine: "line-through",
              opacity: 0.6,
            },
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.priceBox}
        onPress={() => openItemDetail(item)}
      >
        <Text style={styles.priceText}>
          {(parseFloat(item?.priceInfo?.total) || 0).toFixed(2)} €
        </Text>
      </TouchableOpacity>
    </View>
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
            value={nuevoItem}
            onChangeText={setNuevoItem}
            onSubmitEditing={addItem}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA */}
        <FlatList
          data={sortedItems}
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

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  itemName: { marginLeft: 10, fontSize: 16 },

  priceBox: {
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 70,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
