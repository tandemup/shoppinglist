import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";

import StoreSelector from "../components/StoreSelector";
import ItemRow from "../components/ItemRow";
import SearchCombinedBar from "../components/SearchCombinedBar";
import CheckoutBar from "../components/CheckoutBar";

import { ROUTES } from "../navigation/ROUTES";
import { safeAlert } from "../utils/core/safeAlert";

/* -------------------------------------------------
   Screen
-------------------------------------------------- */
export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId } = route.params || {};

  /* ---------------------------
     Contexts
  ----------------------------*/
  const { activeLists, addItem, updateItem, archiveList } = useLists();

  const { getStoreById } = useStores();

  /* ---------------------------
     Lista ACTIVA (fuente única)
  ----------------------------*/
  const list = useMemo(
    () => activeLists.find((l) => l.id === listId),
    [activeLists, listId]
  );

  /* ---------------------------
     Guard clause
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
     Tienda asignada
  ----------------------------*/
  const assignedStore = useMemo(() => {
    if (!list.storeId) return null;
    return getStoreById(list.storeId);
  }, [list.storeId, getStoreById]);

  /* ---------------------------
     Handlers StoreSelector
  ----------------------------*/
  const handleSelectStore = () => {
    if (list.archived) return;

    navigation.navigate(ROUTES.STORE_SELECT, {
      selectForListId: listId,
    });
  };

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
  const totalCurrency = useMemo(() => {
    const itemWithCurrency = list.items.find(
      (i) => i.checked && i.priceInfo?.currency
    );

    return itemWithCurrency?.priceInfo.currency;
  }, [list.items]);

  const total = useMemo(() => {
    return list.items
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + (i.priceInfo?.total ?? 0), 0);
  }, [list.items]);

  /* ---------------------------
     Checkout
  ----------------------------*/
  const handleCheckout = () => {
    if (total <= 0) return;

    safeAlert(
      "Finalizar compra",
      "¿Quieres archivar esta lista y guardar el historial de compras?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            archiveList(list.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  /* ---------------------------
     Render
  ----------------------------*/
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StoreSelector
        store={assignedStore}
        onPress={handleSelectStore}
        disabled={list.archived}
      />

      <SearchCombinedBar
        currentList={list}
        onCreateNew={handleCreateNew}
        onAddFromHistory={handleAddFromHistory}
        onAddFromScan={handleAddFromScan}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {list.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            onToggle={() => handleToggleItem(item.id)}
            onEdit={() => handleEditItem(item.id)}
          />
        ))}
      </ScrollView>

      <CheckoutBar
        total={total}
        currency={totalCurrency}
        onCheckout={handleCheckout}
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
