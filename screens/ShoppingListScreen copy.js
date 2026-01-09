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
import { formatCurrency } from "../utils/store/formatters";

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
  const { activeLists, addItem, updateItem } = useLists();
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
  const total = useMemo(() => {
    return list.items
      .filter((i) => i.checked)
      .reduce((sum, i) => sum + (i.priceInfo?.total ?? 0), 0);
  }, [list.items]);

  const { archiveList, addPurchaseHistory, clearActiveList } = useStore();

  const handleCheckout = () => {
    Alert.alert(
      "Finalizar compra",
      "¿Quieres archivar esta lista y guardar el historial de compras?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: () => {
            // 1. Guardar items en historial
            list.items
              .filter((item) => item.checked)
              .forEach((item) => {
                addPurchaseHistory({
                  ...item,
                  storeId: list.storeId,
                  date: new Date().toISOString(),
                });
              });

            // 2. Archivar lista completa
            archiveList(list.id);

            // 3. Limpiar lista activa / volver
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

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total estimado</Text>
        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
      </View>
      <CheckoutBar total={total} onCheckout={handleCheckout} />
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

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
    fontSize: 23,
    fontWeight: "700",
    color: "#333",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
