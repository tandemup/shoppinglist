// ShoppingListScreen.js — VERSIÓN FINAL COMPATIBLE CON STORECONTEXT

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Animated,
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
import SearchCombinedBar from "../components/SearchCombinedBar";
import ItemRow from "../components/ItemRow";

import { useStore } from "../context/StoreContext";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params;

  const { lists, updateListData, archiveList, reload } = useStore();

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  const footerAnim = useRef(new Animated.Value(0)).current;
  // 0 = visible, 1 = oculto

  let lastScrollY = 0;

  // ------------------------------------------------------
  // Cargar lista desde StoreContext
  // ------------------------------------------------------
  const load = useCallback(() => {
    const found = lists.find((l) => l.id === listId);

    if (found) {
      setList({
        ...found,
        items: Array.isArray(found.items) ? found.items : [],
      });

      navigation.setOptions({ title: found.name });
    }
  }, [lists, listId]);

  // ------------------------------------------------------
  // Recargar datos globales al entrar en la pantalla
  // ------------------------------------------------------
  useEffect(() => {
    reload(); // carga inicial del contexto

    const unsub = navigation.addListener("focus", () => {
      reload(); // recargar al volver
    });

    return unsub;
  }, [navigation]);

  // ------------------------------------------------------
  // 🚀 FIX IMPORTANTE:
  // Cuando cambian las listas globales → cargar esta lista
  // ------------------------------------------------------
  useEffect(() => {
    load();
  }, [lists, load]);

  // ------------------------------------------------------
  // Añadir item manual
  // ------------------------------------------------------
  const addItem = async () => {
    const name = (nuevoItem ?? "").trim();
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

  // ------------------------------------------------------
  // Toggle checked
  // ------------------------------------------------------
  const toggleChecked = async (id) => {
    await updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) =>
        i.id === id ? { ...i, checked: !i.checked } : i
      ),
    }));
  };

  // ------------------------------------------------------
  // Abrir detalle
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Añadir desde histórico
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // Calcular total de la lista
  // ------------------------------------------------------
  const total = list?.items
    ?.filter((i) => i.checked)
    .reduce((acc, item) => acc + (Number(item.priceInfo?.total) || 0), 0)
    ?.toFixed(2);

  if (!list)
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando…</Text>
      </View>
    );

  function Header1() {
    return (
      <View>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => {
            if (!list.items?.length) return;

            safeAlert(
              "Finalizar compra",
              "¿Confirmas que has pagado en la tienda?",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sí, pagar",
                  onPress: async () => {
                    await archiveList(list.id);
                    navigation.navigate("ShoppingLists");
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.payButtonText}>💳 Finalizar compra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ListHeader = React.memo(function ListHeader({
    list,
    total,
    nuevoItem,
    setNuevoItem,
    updateListData,
    listId,
    navigation,
    handleSelectHistoryItem,
    addItem,
  }) {
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

        <SearchCombinedBar
          currentList={list}
          onSelectHistoryItem={handleSelectHistoryItem}
        />

        <View style={styles.addRow}>
          <TextInput
            style={styles.newInput}
            placeholder="Añadir producto..."
            placeholderTextColor="#999"
            value={nuevoItem}
            onChangeText={setNuevoItem}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  });

  const ListFooter = React.memo(function ListFooter({
    total,
    nuevoItem,
    setNuevoItem,
    addItem,
  }) {
    return <Header1 />;
  });

  const StickyFooter = React.memo(function StickyFooter({
    footerAnim,
    total,
    onFinishPurchase,
  }) {
    const translateY = footerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 80], // se mueve hacia abajo al ocultarse
    });

    return (
      <Animated.View
        style={[stickyStyles.container, { transform: [{ translateY }] }]}
      >
        <Text style={stickyStyles.totalText}>Total: {total} €</Text>

        <TouchableOpacity
          style={stickyStyles.payButton}
          onPress={onFinishPurchase}
        >
          <Text style={stickyStyles.payButtonText}>💳 Finalizar compra</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  });
  const hideFooter = () => {
    Animated.timing(footerAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const showFooter = () => {
    Animated.timing(footerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={list.items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ItemRow
              item={item}
              onToggle={toggleChecked}
              onEdit={openItemDetail}
            />
          )}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;

            if (y > lastScrollY + 5) {
              // Scroll bajando → ocultar footer
              hideFooter();
            } else if (y < lastScrollY - 5) {
              // Scroll subiendo → mostrar footer
              showFooter();
            }

            lastScrollY = y;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 120 }} // 🟢 espacio para el footer
          ListHeaderComponent={
            <ListHeader
              list={list}
              total={total}
              nuevoItem={nuevoItem}
              setNuevoItem={setNuevoItem}
              updateListData={updateListData}
              listId={listId}
              navigation={navigation}
              handleSelectHistoryItem={handleSelectHistoryItem}
              addItem={addItem}
            />
          }
        />
        <StickyFooter
          footerAnim={footerAnim}
          total={total}
          onFinishPurchase={() => {
            safeAlert("Finalizar compra", "¿Confirmas que has pagado?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Sí",
                onPress: async () => {
                  await archiveList(list.id);
                  navigation.navigate("ShoppingLists");
                },
              },
            ]);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------
// Estilos
// ---------------------------------
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 20, fontWeight: "600" },
  totalValue: { fontSize: 30, fontWeight: "800" },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
  },

  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
  },
  addButtonText: { color: "#fff", fontSize: 22, fontWeight: "bold" },

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
  newInput1: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8, // opcional si quieres más “aire”
    height: 48, // <-- aumenta el alto (prueba 44, 48, 52…)
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 16,
  },

  payButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  payButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
});

const stickyStyles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,
    paddingVertical: 12,

    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",

    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  totalText: {
    fontSize: 20,
    fontWeight: "700",
  },

  payButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  payButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
