import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { safeAlert } from "../utils/safeAlert";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import ItemRow from "../components/ItemRow";
import StoreSelector from "../components/StoreSelector";
import NewItemInput from "../components/NewItemInput";

import { useStore } from "../context/StoreContext";

export default function ShoppingListScreen({ navigation, route }) {
  const { listId } = route.params;
  const { lists, updateListData, archiveList } = useStore();

  const list = lists.find((l) => l.id === listId);
  const items = list?.items || [];
  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const handleFinish = () => {
    safeAlert(
      "Finalizar compra",
      "Los productos se archivarán y se guardarán en el historial.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            await archiveList(listId);
            navigation.navigate("ShoppingLists");
          },
        },
      ]
    );
  };

  // -------------------------
  // Cambiar tienda
  // -------------------------
  const handleChangeStore = async (store) => {
    await updateListData(listId, (base) => ({
      ...base,
      store,
    }));
  };

  // -------------------------
  // Añadir item
  // -------------------------
  const addItem = async (name) => {
    name = name.trim();
    if (!name) return;

    await updateListData(listId, (base) => ({
      ...base,
      items: [
        {
          id: Date.now().toString(),
          name,
          checked: true, // ← recomendable para tu lógica del total
          priceInfo: {
            qty: 1,
            unitPrice: 0,
            total: 0,
            unitType: "u",
            promo: "none",
            summary: null,
          },
        },
        ...(base.items || []),
      ],
    }));
  };

  // -------------------------
  // Marcar / desmarcar
  // -------------------------
  const toggleItem = async (id) => {
    await updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  // -------------------------
  // Abrir detalle
  // -------------------------
  const openDetail = (item) => {
    navigation.navigate("ItemDetail", {
      item,
      listId,
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

  // -------------------------
  // Total
  // -------------------------
  const total = items
    .filter((i) => i.checked === true)
    .reduce((acc, i) => acc + (i.priceInfo?.total || 0), 0);

  // -------------------------
  // UI
  // -------------------------
  return (
    <View style={styles.container}>
      <StoreSelector
        navigation={navigation}
        store={list?.store}
        onChangeStore={handleChangeStore}
      />

      <NewItemInput onSubmit={addItem} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: footerHeight }}
        renderItem={({ item }) => (
          <ItemRow item={item} onToggle={toggleItem} onEdit={openDetail} />
        )}
      />

      <View
        style={[styles.footer, { paddingBottom: insets.bottom }]}
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
      >
        <Text style={styles.totalText}>💰 {total.toFixed(2)} €</Text>
        <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishText}>💳 Finalizar compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --------------------------------------------------
// ESTILOS
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },

  addRow: {
    flexDirection: "row",
    padding: 10,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
  },

  addBtn: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  addBtnText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginTop: -2,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  totalText: {
    fontSize: 25, // ← más grande
    fontWeight: "700", // ← más fuerte
    textAlign: "right", // ← alineado a la derecha
    width: "100%", // ← ocupa todo el ancho
    color: "#222",
    marginBottom: 8,
  },

  finishBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 6,
  },

  finishText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
