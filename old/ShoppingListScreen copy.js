import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStore } from "../context/StoreContext";
import { useStores } from "../context/StoresContext";
import { useLocation } from "../context/LocationContext";

import StoreSelector from "../components/StoreSelector";
import NewItemInput from "../components/NewItemInput";
import ItemRow from "../components/ItemRow";

import { ROUTES } from "../navigation/ROUTES";
import { defaultPriceInfo } from "../utils/core/defaultItem";
import { getDistanceKm } from "../utils/math/distance";
import { getOpenStatus } from "../utils/store/openingHours";
import { safeAlert } from "../utils/core/safeAlert";

export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId } = route.params ?? {};

  const { lists, updateListData, archiveList } = useStore();
  const { stores } = useStores();
  const { location } = useLocation();

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
  // TIENDA ASIGNADA (derivada por ID)
  // ────────────────────────────────────────────────
  const assignedStore = useMemo(() => {
    if (!list.storeId) return null;
    return stores.find((s) => s.id === list.storeId) ?? null;
  }, [list.storeId, stores]);

  const distanceKm =
    assignedStore && location
      ? getDistanceKm(location, assignedStore.location)
      : null;

  const openStatus = assignedStore?.hours
    ? getOpenStatus(assignedStore.hours)
    : null;

  // ────────────────────────────────────────────────
  // SELECCIONAR TIENDA (FLUJO CORRECTO)
  // ────────────────────────────────────────────────
  const handleSelectStore = () => {
    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_FAVORITES,
      params: {
        selectForListId: listId,
      },
    });
  };

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
          checked: true,
          priceInfo: defaultPriceInfo(),
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
    navigation.navigate(ROUTES.ITEM_DETAIL, {
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
  // TOTAL
  // ────────────────────────────────────────────────
  const total = items.reduce((sum, i) => {
    if (!i.checked) return sum;
    return sum + (Number(i.priceInfo?.total) || 0);
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
      safeAlert("Sin productos", "Marca al menos un producto", [
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

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {items.length === 0 && (
            <Text style={styles.emptyText}>
              No hay productos en esta lista 😊
            </Text>
          )}

          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onEdit={openDetail}
            />
          ))}
        </ScrollView>
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
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
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
