import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";

import { useStore } from "../context/StoreContext";
import { useLocation } from "../context/LocationContext";
import { useStores } from "../context/StoresContext";

import NewItemInput from "../components/NewItemInput";
import ItemRow from "../components/ItemRow";
import { ROUTES } from "../navigation/ROUTES";
import { getDistanceKm } from "../utils/distance";
import { getOpenStatus } from "../utils/openingHours";

export default function ShoppingListScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId, selectedStore } = route.params ?? {};

  const { lists, updateListData, archiveList, setStoreForList } = useStore();

  const { stores } = useStores();
  const { location } = useLocation();

  // ────────────────────────────────────────────────
  // 🛡️ PROTECCIONES
  // ────────────────────────────────────────────────
  if (!lists || !listId) {
    return null;
  }

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
  // 🏪 ASIGNAR TIENDA DESDE NAVEGACIÓN
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedStore?.id && listId) {
      setStoreForList(listId, selectedStore.id);
      navigation.setParams({ selectedStore: undefined });
    }
  }, [selectedStore, listId]);

  // ────────────────────────────────────────────────
  // 🏪 TIENDA ASIGNADA
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

  const handleAddItem = async (name) => {
    await updateListData(listId, (list) => ({
      ...list,
      items: [
        ...(list.items || []),
        {
          id: Date.now().toString(),
          name,
          checked: false,
        },
      ],
    }));
  };

  // ────────────────────────────────────────────────
  // 🧮 TOTAL
  // ────────────────────────────────────────────────
  const total = items.reduce(
    (sum, i) => sum + (i.checked ? i.price * i.qty : 0),
    0
  );

  // ────────────────────────────────────────────────
  // 🛒 FINALIZAR COMPRA
  // ────────────────────────────────────────────────
  const handleFinish = async () => {
    const purchased = items.filter((i) => i.checked);

    await updateListData(listId, (base) => ({
      ...base,
      items: purchased,
    }));

    await archiveList(listId);
    navigation.navigate(ROUTES.SHOPPING_LISTS);
  };

  // ────────────────────────────────────────────────
  // 🧱 RENDER
  // ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{list.name}</Text>

      {/* 🏪 TIENDA */}
      <Pressable
        style={styles.storeBox}
        onPress={() =>
          navigation.navigate(ROUTES.STORES_TAB, {
            screen: ROUTES.STORES_BROWSE,
            params: { selectForListId: listId },
          })
        }
      >
        {assignedStore ? (
          <>
            <Text style={styles.storeName}>{assignedStore.name}</Text>
            {distanceKm != null && (
              <Text style={styles.meta}>{distanceKm} km</Text>
            )}
            {openStatus && (
              <Text
                style={[
                  styles.meta,
                  { color: openStatus.open ? "green" : "red" },
                ]}
              >
                {openStatus.label}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.selectStore}>Seleccionar tienda</Text>
        )}
      </Pressable>

      {/* ➕ NUEVO ITEM */}
      <NewItemInput listId={listId} />

      {/* 📋 ITEMS */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemRow item={item} listId={listId} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* 🧾 FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.total}>Total: {total.toFixed(2)} €</Text>

        <Pressable
          style={[
            styles.finishBtn,
            !items.some((i) => i.checked) && styles.disabled,
          ]}
          disabled={!items.some((i) => i.checked)}
          onPress={handleFinish}
        >
          <Text style={styles.finishText}>Finalizar compra</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────
// 🎨 ESTILOS
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
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  storeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectStore: {
    color: "#666",
  },
  meta: {
    fontSize: 12,
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
