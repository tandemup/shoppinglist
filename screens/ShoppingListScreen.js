import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStore } from "../context/StoreContext";
import { useLocation } from "../context/LocationContext";
import { useStores } from "../context/StoresContext";

import StoreSelector from "../components/StoreSelector";
import NewItemInput from "../components/NewItemInput";
import ItemRow from "../components/ItemRow";

import { ROUTES } from "../navigation/ROUTES";
import { getDistanceKm } from "../utils/distance";
import { getOpenStatus } from "../utils/openingHours";
import { safeAlert } from "../utils/safeAlert";

export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId, selectedStore } = route.params ?? {};
  const { lists, updateListData, archiveList, setStoreForList } = useStore();
  const { stores } = useStores();
  const { location } = useLocation();

  // ────────────────────────────────────────────────
  // PROTECCIONES
  // ────────────────────────────────────────────────
  if (!lists || !listId) return null;

  const list = lists.find((l) => l.id === listId);
  if (!list) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Lista no encontrada</Text>
      </SafeAreaView>
    );
  }

  const items = list.items ?? [];

  // ────────────────────────────────────────────────
  // ASIGNAR TIENDA DESDE STORE_SELECT
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedStore?.id) {
      setStoreForList(listId, selectedStore.id);
      navigation.setParams({ selectedStore: undefined });
    }
  }, [selectedStore]);

  // ────────────────────────────────────────────────
  // TIENDA ASIGNADA
  // ────────────────────────────────────────────────
  const assignedStore = useMemo(() => {
    if (!list.storeId) return null;
    return stores.find((s) => s.id === list.storeId);
  }, [list.storeId, stores]);

  const distanceKm =
    assignedStore && location
      ? getDistanceKm(location, assignedStore.location)
      : null;

  const openStatus = assignedStore?.hours
    ? getOpenStatus(assignedStore.hours)
    : null;

  // ────────────────────────────────────────────────
  // ITEMS
  // ────────────────────────────────────────────────
  const handleAddItem = async (name) => {
    if (!name?.trim()) return;

    await updateListData(listId, (base) => ({
      ...base,
      items: [
        ...(base.items || []),
        {
          id: Date.now().toString(),
          name: name.trim(),
          checked: false,
          qty: 1,
          price: 0,
        },
      ],
    }));
  };

  const toggleItem = async (id) => {
    await updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

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

  // ────────────────────────────────────────────────
  // SELECCIONAR TIENDA
  // ────────────────────────────────────────────────
  const handleSelectStore = () => {
    navigation.navigate(ROUTES.STORE_SELECT, {
      listId,
      selectForListId: listId,
    });
  };

  // ────────────────────────────────────────────────
  // TOTAL
  // ────────────────────────────────────────────────
  const total = items.reduce((sum, i) => {
    if (!i.checked) return sum;
    const price = Number(i.price) || 0;
    const qty = Number(i.qty) || 1;
    return sum + price * qty;
  }, 0);

  // ────────────────────────────────────────────────
  // FINALIZAR COMPRA
  // ────────────────────────────────────────────────
  const handleFinish = () => {
    if (!list.storeId) {
      safeAlert(
        "Tienda no seleccionada",
        "Selecciona una tienda antes de finalizar la compra",
        [{ text: "OK" }]
      );
      return;
    }

    const purchased = items.filter((i) => i.checked);
    if (purchased.length === 0) {
      safeAlert("Sin productos", "Marca al menos un producto como comprado", [
        { text: "OK" },
      ]);
      return;
    }

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
              items: purchased,
            }));
            await archiveList(listId);
            navigation.navigate(ROUTES.SHOPPING_LISTS);
          },
        },
      ]
    );
  };

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <StoreSelector
          store={assignedStore}
          distanceKm={distanceKm}
          openStatus={openStatus}
          onPress={handleSelectStore}
        />

        {!list.archived && <NewItemInput onSubmit={handleAddItem} />}

        {list.archived && (
          <Text style={styles.archivedText}>Esta lista está archivada</Text>
        )}

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemRow item={item} onToggle={toggleItem} onEdit={openDetail} />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 140,
            flexGrow: items.length === 0 ? 1 : undefined,
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay productos en la lista</Text>
            </View>
          }
        />
      </View>

      {!list.archived && items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total: {total.toFixed(2)} €</Text>

          <Pressable
            style={[styles.finishBtn, !list.storeId && styles.disabled]}
            onPress={handleFinish}
            disabled={!list.storeId}
          >
            <Text style={styles.finishText}>Finalizar compra</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ────────────────────────────────────────────────
// ESTILOS
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  archivedText: {
    color: "#888",
    marginBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  total: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  finishBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  finishText: {
    color: "#fff",
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: "#bbb",
  },
});
