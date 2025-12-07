// ShoppingListScreen.js — VERSIÓN FINAL COMPATIBLE CON STORECONTEXT

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
import { SafeAreaView } from "react-native-safe-area-context";

import { defaultItem, defaultPriceInfo } from "../utils/defaultItem";
import { generateId } from "../utils/generateId";
import { safeAlert } from "../utils/safeAlert";

import StoreSelector from "../components/StoreSelector";
import SearchCombinedBar from "../components/SearchCombinedBar";
import ItemRow from "../components/ItemRow";

import { useStore } from "../context/StoreContext";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;

  const { lists, updateListData, archiveList, reload } = useStore();

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  // ------------------------------------------------------
  // Cargar lista desde StoreContext
  // ------------------------------------------------------
  const load = useCallback(() => {
    const found = lists.find((l) => l.id === listId);

    if (found) {
      setList({
        ...found,
        items: Array.isArray(found.items) ? found.items : [],
      });

      navigation.setOptions({ title: found.name });
    }
  }, [lists, listId]);

  // ------------------------------------------------------
  // Recargar datos globales al entrar en la pantalla
  // ------------------------------------------------------
  useEffect(() => {
    reload(); // carga inicial del contexto

    const unsub = navigation.addListener("focus", () => {
      reload(); // recargar al volver
    });

    return unsub;
  }, [navigation]);

  // ------------------------------------------------------
  // 🚀 FIX IMPORTANTE:
  // Cuando cambian las listas globales → cargar esta lista
  // ------------------------------------------------------
  useEffect(() => {
    load();
  }, [lists, load]);

  // ------------------------------------------------------
  // Añadir item manual
  // ------------------------------------------------------
  const addItem = async () => {
    const name = (nuevoItem ?? "").trim();
    if (!name) return;

    const newItem = {
      ...defaultItem,
      id: generateId(),
      name,
      checked: true,
      priceInfo: defaultPriceInfo(),
    };

    await updateListData(listId, (base) => ({
      ...base,
      items: [newItem, ...(base.items || [])],
    }));

    setNuevoItem("");
  };

  // ------------------------------------------------------
  // Toggle checked
  // ------------------------------------------------------
  const toggleChecked = async (id) => {
    await updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  // ------------------------------------------------------
  // Abrir detalle
  // ------------------------------------------------------
  const openItemDetail = (item) => {
    navigation.navigate("ItemDetailScreen", {
      item,
      onSave: async (updated) => {
        await updateListData(listId, (base) => ({
          ...base,
          items: base.items.map((i) => (i.id === updated.id ? updated : i)),
        }));
      },
      onDelete: async (id) => {
        await updateListData(listId, (base) => ({
          ...base,
          items: base.items.filter((i) => i.id !== id),
        }));
      },
    });
  };

  // ------------------------------------------------------
  // Añadir desde histórico
  // ------------------------------------------------------
  const handleSelectHistoryItem = async (historyItem) => {
    const newItem = {
      ...defaultItem,
      id: generateId(),
      name: historyItem.name || "",
      brand: historyItem.brand || "",
      barcode: historyItem.barcode || "",
      image: historyItem.image || null,
      checked: true,

      priceInfo: {
        ...defaultPriceInfo(),
        ...historyItem.priceInfo,
      },
    };

    await updateListData(listId, (base) => ({
      ...base,
      items: [newItem, ...(base.items || [])],
    }));
  };

  // ------------------------------------------------------
  // Calcular total de la lista
  // ------------------------------------------------------
  const total = list?.items
    ?.filter((i) => i.checked)
    .reduce((acc, item) => acc + (Number(item.priceInfo?.total) || 0), 0)
    ?.toFixed(2);

  if (!list)
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando…</Text>
      </View>
    );

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={list.items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onToggle={toggleChecked}
              onEdit={openItemDetail}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListHeaderComponent={
            <View>
              <StoreSelector
                navigation={navigation}
                store={list.store}
                onChangeStore={async (newStore) => {
                  await updateListData(listId, (base) => ({
                    ...base,
                    store: newStore,
                  }));
                }}
              />

              {/* Finalizar compra */}
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                  if (!list.items?.length) return;

                  safeAlert(
                    "Finalizar compra",
                    "¿Confirmas que has pagado en la tienda?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Sí, pagar",
                        onPress: async () => {
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

              <SearchCombinedBar
                currentList={list}
                onSelectHistoryItem={handleSelectHistoryItem}
              />

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{total} €</Text>
              </View>

              {/* Añadir manual */}
              <View style={styles.addRow}>
                <TextInput
                  style={styles.newInput}
                  placeholder="Añadir producto..."
                  value={nuevoItem}
                  onChangeText={setNuevoItem}
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

// ---------------------------------
// Estilos
// ---------------------------------
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  payButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
});
