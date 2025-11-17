// screens/ShoppingListScreen.js
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { safeAlert } from "../utils/safeAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAllLists, updateList } from "../utils/listStorage";
import ItemRow from "../components/ItemRow";
import { defaultItem } from "../utils/defaultItem";
import SearchCombinedBar from "../components/SearchCombinedBar";
import StoreSelector from "../components/StoreSelector";

export default function ShoppingListScreen({ route, navigation }) {
  const { listId } = route.params || {};

  const [list, setList] = useState(null);
  const [nuevoItem, setNuevoItem] = useState("");

  // 👉 Donde guardamos la tienda seleccionada sin Zustand
  const storeRef = useRef(null);

  const handleStoreSelected = async (store) => {
    storeRef.current = store;

    const updatedList = {
      ...list,
      store,
    };

    setList(updatedList);
    await updateList(listId, updatedList);
  };

  const loadList = useCallback(async () => {
    try {
      const allLists = await getAllLists();
      const found = allLists.find((l) => String(l.id) === String(listId));
      if (!found) {
        safeAlert("Error", "No se encontró la lista.");
        navigation.goBack();
        return;
      }
      setList(found);
    } catch (err) {
      console.error("Error cargando lista:", err);
    }
  }, [listId, navigation]);

  useEffect(() => {
    loadList();
    const unsubscribe = navigation.addListener("focus", loadList);
    return unsubscribe;
  }, [navigation, loadList]);

  useEffect(() => {
    if (list?.name) {
      navigation.setOptions({ title: list.name });
    }
  }, [navigation, list?.name]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const addItem = async () => {
    if (!nuevoItem.trim() || !list) return;

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    const newItem = {
      ...defaultItem,
      id: Date.now().toString(),
      name: nuevoItem.trim(),
      date: formattedDate,
      checked: true,
    };

    const updatedList = {
      ...list,
      items: [newItem, ...(list.items || [])],
    };

    setList(updatedList);
    setNuevoItem("");
    await updateList(listId, updatedList);
  };

  const toggleChecked = useCallback(
    async (id) => {
      if (!list) return;

      const updatedList = {
        ...list,
        items: list.items.map((i) =>
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      };

      setList(updatedList);
      await updateList(listId, updatedList);
    },
    [list]
  );

  const openItemDetail = (item) => {
    navigation.navigate("ItemDetailScreen", {
      item,
      onSave: async (updatedItem) => {
        setList((prevList) => {
          const updatedItems = prevList.items.map((i) =>
            i.id === updatedItem.id ? { ...i, ...updatedItem } : i
          );
          const updatedList = { ...prevList, items: updatedItems };
          updateList(listId, updatedList);
          return updatedList;
        });
      },
      onDelete: async (id) => {
        setList((prevList) => {
          const updatedList = {
            ...prevList,
            items: prevList.items.filter((i) => i.id !== id),
          };
          updateList(listId, updatedList);
          return updatedList;
        });
      },
    });
  };

  const total = useMemo(() => {
    if (!list || !list.items?.length) return "0.00";
    const sum = list.items
      .filter((i) => i.checked)
      .reduce((acc, i) => {
        const p = i.priceInfo || {};
        const subtotal =
          p.total ?? parseFloat(p.unitPrice || 0) * parseFloat(p.qty || 1);
        return acc + (isNaN(subtotal) ? 0 : subtotal);
      }, 0);

    return sum.toFixed(2);
  }, [list]);

  const renderItem = ({ item }) => (
    <ItemRow item={item} onToggle={toggleChecked} onEdit={openItemDetail} />
  );

  if (!list) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#888", textAlign: "center", marginTop: 30 }}>
          Cargando lista...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* 🏬 SELECTOR DE TIENDA */}
        <StoreSelector navigation={navigation} />

        {/* 💰 Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{total} €</Text>
        </View>

        {/* 🔍 Búsqueda */}
        <SearchCombinedBar
          currentList={list}
          onSelectHistoryItem={(historyItem) => {
            const item = {
              ...historyItem.item,
              id: Date.now().toString(),
              checked: true,
            };
            const updatedList = {
              ...list,
              items: [item, ...list.items],
            };
            setList(updatedList);
            updateList(listId, updatedList);
          }}
        />

        {/* ➕ Añadir */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.newInput}
            placeholder="Añadir producto..."
            placeholderTextColor="#999"
            value={nuevoItem}
            onChangeText={setNuevoItem}
            onSubmitEditing={addItem}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <FlatList
          data={list.items || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 6,
  },
  storeName: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 6,
    fontStyle: "italic",
  },

  card: {
    backgroundColor: "#E3F2FD", // 💙 Azul muy claro (Material Blue 50)
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,

    borderColor: "#BBDEFB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },

  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    borderColor: "#BBDEFB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  totalLabel: { fontSize: 20, fontWeight: "600" },
  totalValue: { fontSize: 30, fontWeight: "800" },
  addRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 5 },
  newInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
