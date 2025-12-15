import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ROUTES } from "../navigation/ROUTES";

import { safeAlert } from "../utils/safeAlert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ItemRow from "../components/ItemRow";
import StoreSelector from "../components/StoreSelector";
import SearchCombinedBar from "../components/SearchCombinedBar";
import { loadShoppingLocation } from "../utils/locationPlacesService";

import { useStore } from "../context/StoreContext";
import { ItemFactory } from "../utils/ItemFactory";

export default function ShoppingListScreen({ navigation, route }) {
  const [shoppingPlace, setShoppingPlace] = useState(null);

  const { listId } = route.params;
  const { lists, updateItem, updateListData, archiveList } = useStore();

  const list = lists.find((l) => l.id === listId);
  const items = list?.items || [];

  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadShoppingLocation().then(setShoppingPlace);
  }, []);

  // ────────────────────────────────────────────────
  // CAMBIAR TIENDA (callback que se pasa al selector)
  // ────────────────────────────────────────────────
  const handleChangeStore = async (store) => {
    if (!store) return;

    await updateListData(listId, (base) => ({
      ...base,
      store,
    }));
  };

  // ────────────────────────────────────────────────
  // NUEVO ITEM
  // ────────────────────────────────────────────────
  const handleCreateNewItem = async (name) => {
    const clean = (name ?? "").trim();
    if (!clean) return;

    const newItem = ItemFactory.create(clean);

    await updateListData(listId, (base) => ({
      ...base,
      items: [newItem, ...(base.items ?? [])],
    }));
  };

  // ────────────────────────────────────────────────
  // EDITAR ITEM
  // ────────────────────────────────────────────────
  const openStoreSelector = () => {
    navigation.navigate(ROUTES.STORES, {
      onSelectStore: handleChangeStore,
    });
  };

  const openEditor = (item) => {
    navigation.navigate(ROUTES.ITEM_DETAIL, {
      item: ItemFactory.clone(item),
      listId,

      onSave: async (patch) => {
        await updateItem(listId, item.id, patch);
      },

      onDelete: async () => {
        await updateListData(listId, (base) => ({
          ...base,
          items: base.items.filter((i) => i.id !== item.id),
        }));
      },
    });
  };

  // ────────────────────────────────────────────────
  // TOGGLE CHECK
  // ────────────────────────────────────────────────
  const toggleCheck = async (itemId) => {
    const found = items.find((i) => i.id === itemId);
    if (!found) return;

    await updateItem(listId, itemId, {
      checked: !found.checked,
    });
  };

  // ────────────────────────────────────────────────
  // FINALIZAR COMPRA
  // ────────────────────────────────────────────────
  const handleFinish = () => {
    if (!list?.store || !list.store.name?.trim()) {
      safeAlert(
        "Tienda no seleccionada",
        "Por favor, selecciona una tienda antes de finalizar la compra.",
        [{ text: "OK" }]
      );
      return;
    }

    const purchasedItems = items.filter((i) => i.checked);

    safeAlert(
      "Finalizar compra",
      "Se archivarán únicamente los productos marcados.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            await updateListData(listId, (base) => ({
              ...base,
              items: purchasedItems,
            }));

            await archiveList(listId);
            navigation.navigate(ROUTES.SHOPPING_LISTS);
          },
        },
      ]
    );
  };

  // ────────────────────────────────────────────────
  // TOTAL
  // ────────────────────────────────────────────────
  const total = items
    .filter((i) => i.checked)
    .reduce((acc, i) => acc + (i.priceInfo?.total || 0), 0);

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StoreSelector
        navigation={navigation}
        store={list?.store}
        onPress={openStoreSelector}
      />
      {shoppingPlace?.storeId === list?.store?.id && (
        <View style={styles.hereBanner}>
          <Text style={styles.hereBannerText}>
            🟢 Estás comprando en {shoppingPlace.label}
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
        <SearchCombinedBar
          currentList={list}
          onSelectHistoryItem={() => {}}
          onCreateItem={handleCreateNewItem}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: footerHeight }}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            onToggle={toggleCheck}
            onPressDetail={() => openEditor(item)}
          />
        )}
      />

      {/* FOOTER */}
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

// ────────────────────────────────────────────────
// 🎨 ESTILOS
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 12,
    paddingHorizontal: 16,
  },

  totalText: {
    fontSize: 25,
    fontWeight: "700",
    textAlign: "right",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hereBanner: {
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 8,
    padding: 10,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2e7d32",
  },
  hereBannerText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
