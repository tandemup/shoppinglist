// ShoppingListScreen.js — versión completa y corregida

import { generateId } from "../utils/generateId";

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
import { safeAlert } from "../utils/safeAlert";

import { useStore } from "../context/StoreContext"; // IMPORTANTE

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;

  const { archiveList, addItemsToHistory } = useStore();

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  //
  // HAMBURGUESA
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
  // CARGAR LISTA
  //
  const loadList = useCallback(async () => {
    const data = await getList(listId);

    if (!data) {
      const empty = { id: listId, name: "Nueva lista", items: [] };
      await updateList(listId, () => empty);
      setList(empty);
      navigation.setOptions({ title: empty.name });
      return;
    }

    setList({
      ...data,
      items: Array.isArray(data.items) ? data.items : [],
    });

    navigation.setOptions({ title: data.name });
  }, [listId]);

  useEffect(() => {
    loadList();
    const unsub = navigation.addListener("focus", loadList);
    return unsub;
  }, [navigation, loadList]);

  //
  // PROTECCIÓN PARA prev NULL
  //
  const ensurePrev = (prev) => {
    if (prev && typeof prev === "object") {
      return {
        ...prev,
        items: Array.isArray(prev.items) ? prev.items : [],
      };
    }
    return { id: listId, name: "Nueva lista", items: [] };
  };

  //
  // AÑADIR ITEM MANUAL — al principio
  //
  const addItem = async () => {
    const name = (nuevoItem ?? "").toString().trim();
    if (!name) return;

    const newItem = {
      ...defaultItem,
      id: generateId(),
      name,
      checked: true,
      priceInfo: { total: 0, unitPrice: 0, qty: 1 },
    };

    await updateList(listId, (prev) => {
      const base = ensurePrev(prev);
      const safeItems = Array.isArray(base.items) ? base.items : [];

      return {
        ...base,
        items: [newItem, ...safeItems], // 👈 AL PRINCIPIO
      };
    });

    setNuevoItem("");
    loadList();
  };

  //
  // TOGGLE CHECK
  //
  const toggleChecked = async (id) => {
    await updateList(listId, (prev) => {
      const base = ensurePrev(prev);

      return {
        ...base,
        items: base.items.map((i) =>
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      };
    });

    loadList();
  };

  //
  // DETALLE DE ITEM
  //
  const openItemDetail = (item) => {
    navigation.navigate("ItemDetailScreen", {
      item,

      onSave: async (updated) => {
        await updateList(listId, (prev) => {
          const base = ensurePrev(prev);

          return {
            ...base,
            items: base.items.map((i) => (i.id === updated.id ? updated : i)),
          };
        });
      },

      onDelete: async (id) => {
        await updateList(listId, (prev) => {
          const base = ensurePrev(prev);
          return {
            ...base,
            items: base.items.filter((i) => i.id !== id),
          };
        });
      },
    });
  };

  //
  // TOTAL
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
  // AÑADIR ITEM DESDE SEARCH BAR (sugerencia) — al principio
  //
  const handleSelectHistoryItem = async (historyItem) => {
    const newItem = {
      ...defaultItem,
      id: generateId(),
      name: historyItem.name || "",
      brand: historyItem.brand || "",
      barcode: historyItem.barcode || "",
      image: historyItem.image || null,
      priceInfo: historyItem.priceInfo || { total: 0, unitPrice: 0, qty: 1 },
      checked: true,
    };

    await updateList(listId, (prev) => {
      const base = ensurePrev(prev);
      return {
        ...base,
        items: [newItem, ...base.items], // 👈 AL PRINCIPIO
      };
    });

    loadList();
  };

  const renderItem = ({ item }) => (
    <ItemRow item={item} onToggle={toggleChecked} onEdit={openItemDetail} />
  );

  if (!list) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  //
  // RENDER PRINCIPAL
  //
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={list.items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListHeaderComponent={
            <View>
              <StoreSelector navigation={navigation} />

              {/* BOTÓN PAGAR */}
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                  if (!list.items || list.items.length === 0) return;

                  safeAlert(
                    "Finalizar compra",
                    "¿Confirmas que has pagado en la tienda?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Sí, pagar",
                        onPress: async () => {
                          await addItemsToHistory(
                            list.items.map((i) => ({
                              ...i,
                              listName: list.name,
                            }))
                          );

                          await archiveList(list.id);

                          navigation.navigate("ShoppingLists");
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.payButtonText}>💳 Finalizar compra</Text>
              </TouchableOpacity>

              {/* BUSCADOR */}
              <SearchCombinedBar
                currentList={list}
                onSelectHistoryItem={handleSelectHistoryItem}
              />

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
                  blurOnSubmit={false}
                />
                <TouchableOpacity style={styles.addButton} onPress={addItem}>
                  <Text style={styles.addButtonText}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
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

  payButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  payButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
