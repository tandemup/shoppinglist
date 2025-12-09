// ShoppingListScreen.js — VERSIÓN FINAL OPTIMIZADA SIN RELOAD NI ESTADO DUPLICADO
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import SmartSearchBar from "../components/SmartSearchBar";
import ItemRow from "../components/ItemRow";

import { useStore } from "../context/StoreContext";

/* --------------------------------------------------------
   LIST HEADER
-------------------------------------------------------- */
const ListHeader = React.memo(function ListHeader({
  list,
  nuevoItem,
  setNuevoItem,
  listId,
  navigation,
  updateListData,
  handleSelectHistoryItem,
  addItem,
}) {
  const [localText, setLocalText] = useState(nuevoItem);

  useEffect(() => {
    setLocalText(nuevoItem);
  }, [nuevoItem]);

  const handleSubmit = () => {
    const name = localText.trim();
    if (!name) return;

    addItem(name);
    setLocalText("");
    setNuevoItem("");
  };

  return (
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

      <SmartSearchBar
        currentList={list}
        onSelectHistoryItem={handleSelectHistoryItem}
      />

      {/* INPUT AÑADIR PRODUCTO */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.newInput}
          placeholder="Añadir producto..."
          placeholderTextColor="#999"
          value={localText}
          onChangeText={setLocalText}
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/* --------------------------------------------------------
   STICKY FOOTER
-------------------------------------------------------- */
const StickyFooter = React.memo(function StickyFooter({ total, onFinish }) {
  return (
    <View style={stickyStyles.container}>
      <Text style={stickyStyles.totalText}>Total: {total} €</Text>

      <TouchableOpacity style={stickyStyles.payButton} onPress={onFinish}>
        <Text style={stickyStyles.payButtonText}>💳 Finalizar compra</Text>
      </TouchableOpacity>
    </View>
  );
});

/* --------------------------------------------------------
   PANTALLA PRINCIPAL
-------------------------------------------------------- */
export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;
  const { lists, updateListData, archiveList } = useStore();
  const [nuevoItem, setNuevoItem] = useState("");

  // Obtener lista DIRECTAMENTE del contexto (sin estado duplicado)
  const list = useMemo(
    () => lists.find((l) => l.id === listId),
    [lists, listId]
  );

  // Cambiar título cuando cargue la lista
  useEffect(() => {
    if (list) {
      navigation.setOptions({ title: list.name });
    }
  }, [list]);

  /* Añadir item */
  const addItem = async (nameOverride) => {
    const name = nameOverride ?? nuevoItem.trim();
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

  /* Toggle check */
  const toggleChecked = async (id) => {
    await updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  /* Abrir detalle */
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

  /* Añadir desde histórico */
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

  /* Total memoizado */
  const total = useMemo(() => {
    if (!list) return "0.00";

    return list.items
      .filter((i) => i.checked)
      .reduce((acc, i) => acc + Number(i.priceInfo?.total || 0), 0)
      .toFixed(2);
  }, [list]);

  if (!list)
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando…</Text>
      </View>
    );

  /* ListHeader memoizado */
  const renderHeader = useCallback(() => {
    return (
      <ListHeader
        list={list}
        nuevoItem={nuevoItem}
        setNuevoItem={setNuevoItem}
        listId={listId}
        navigation={navigation}
        updateListData={updateListData}
        handleSelectHistoryItem={handleSelectHistoryItem}
        addItem={addItem}
      />
    );
  }, [list, nuevoItem]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "position" : undefined}
      >
        <FlatList
          keyboardShouldPersistTaps="always"
          data={list.items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onToggle={toggleChecked}
              onEdit={openItemDetail}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 0 }}
        />

        <StickyFooter
          total={total}
          onFinish={() =>
            safeAlert("Finalizar compra", "¿Confirmas que has pagado?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Sí",
                onPress: async () => {
                  await archiveList(list.id);
                  navigation.navigate("ShoppingLists");
                },
              },
            ])
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------------------------------------------------------
   ESTILOS
-------------------------------------------------------- */
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
    height: 40,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    height: 40,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});

const stickyStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  totalText: { fontSize: 20, fontWeight: "700" },
  payButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
