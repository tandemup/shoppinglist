import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";

import StoreSelector from "../components/StoreSelector";
import ItemRow from "../components/ItemRow";
import SearchCombinedBar from "../components/SearchCombinedBar";

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
  const { activeLists, addItem, updateItem } = useLists();
  const { getStoreById } = useStores();

  /* ---------------------------
     Lista ACTIVA (única fuente válida)
  ----------------------------*/
  const list = useMemo(
    () => activeLists.find((l) => l.id === listId),
    [activeLists, listId]
  );

  /* ---------------------------
     Guard clause CRÍTICA
  ----------------------------*/
  useEffect(() => {
    if (!list) {
      navigation.replace(ROUTES.SHOPPING_LISTS);
    }
  }, [list, navigation]);

  if (!list) {
    return (
      <View style={styles.center}>
        <Text>Esta lista ya no está activa</Text>
      </View>
    );
  }

  /* ---------------------------
     Tienda asignada (solo lectura)
  ----------------------------*/
  const assignedStore = useMemo(() => {
    if (!list.storeId) return null;
    return getStoreById(list.storeId);
  }, [list.storeId, getStoreById]);

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
     Total (solo items checked)
  ----------------------------*/
  const total = useMemo(() => {
    return list.items
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + (i.priceInfo?.total ?? 0), 0);
  }, [list.items]);

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
            <StoreSelector store={assignedStore} disabled />
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
