import React, { useMemo, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { useStore } from "../context/StoreContext";
import { useStores } from "../context/StoresContext";

import StoreSelector from "../components/StoreSelector";
import ItemRow from "../components/ItemRow";
import SearchCombinedBar from "../components/SearchCombinedBar";

import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../navigation/ROUTES";
import { formatCurrency } from "../utils/store/formatters";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId, selectedStore } = route.params || {};

  /* ---------------------------
     Contexts
  ----------------------------*/
  const { lists, addItem, updateItem } = useLists();
  const { setStoreForList, getStoreIdForList } = useStore();
  const { getStoreById } = useStores();

  const list = lists.find((l) => l.id === listId);

  /* ---------------------------
     Tienda asignada
  ----------------------------*/
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.STORES_TAB)}
          style={{ paddingHorizontal: 16 }}
        >
          <Ionicons name="menu-outline" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (!selectedStore || !listId) return;

    setStoreForList(listId, selectedStore.id);

    navigation.setParams({ selectedStore: undefined });
  }, [selectedStore, listId]);

  const assignedStore = useMemo(() => {
    if (selectedStore) return selectedStore;

    const storeId = getStoreIdForList(listId);
    if (!storeId) return null;

    return getStoreById(storeId);
  }, [selectedStore, listId, getStoreIdForList, getStoreById]);

  /* ---------------------------
     Handlers SearchCombinedBar
  ----------------------------*/
  const handleCreateNew = (name) => {
    addItem(listId, { name });
  };

  const handleAddFromHistory = (historicItem) => {
    addItem(listId, {
      name: historicItem.name,
      priceInfo: historicItem.priceInfo,
      checked: true,
    });
  };

  const handleAddFromScan = (scanItem) => {
    addItem(listId, {
      name: scanItem.name,
      priceInfo: scanItem.priceInfo,
      checked: true,
    });
  };

  /* ---------------------------
     Handlers ItemRow
  ----------------------------*/
  const handleToggleItem = (itemId) => {
    const item = list.items.find((i) => i.id === itemId);
    if (!item) return;

    updateItem(listId, itemId, {
      checked: !item.checked,
    });
  };

  const handleEditItem = (itemId) => {
    navigation.navigate(ROUTES.ITEM_DETAIL, {
      listId,
      itemId,
    });
  };

  /* ---------------------------
     StoreSelector handler
     (IMPORTANTE)
  ----------------------------*/
  const handleSelectStore = () => {
    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_FAVORITES,
      params: {
        selectForListId: listId,
        mode: "select",
      },
    });
  };

  /* ---------------------------
     Total
  ----------------------------*/
  const total = useMemo(() => {
    if (!list) return 0;

    return list.items
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + (i.priceInfo?.total ?? 0), 0);
  }, [list]);

  if (!list) {
    return (
      <View style={styles.center}>
        <Text>Lista no encontrada</Text>
      </View>
    );
  }

  /* ---------------------------
     Render
  ----------------------------*/
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            onToggle={() => handleToggleItem(item.id)}
            onEdit={() => handleEditItem(item.id)}
          />
        )}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <StoreSelector store={assignedStore} onPress={handleSelectStore} />
            <SearchCombinedBar
              currentList={list}
              onCreateNew={handleCreateNew}
              onAddFromHistory={handleAddFromHistory}
              onAddFromScan={handleAddFromScan}
            />
          </>
        }
        ListFooterComponent={
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },

  totalContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e7d32",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
