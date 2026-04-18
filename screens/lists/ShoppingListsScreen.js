import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useLists } from "../../context/ListsContext";
import { ROUTES } from "../../navigation/ROUTES";
import { DEFAULT_CURRENCY } from "../../constants/currency";
import CurrencyBadge from "../../components/ui/CurrencyBadge";
import ContextMenu from "../../components/ui/ContextMenu";

export default function ShoppingListsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    activeLists = [],
    archivedLists = [],
    createList,
    deleteList,
    updateList,
    archiveList,
  } = useLists();

  const [editingList, setEditingList] = useState(null);
  const [editName, setEditName] = useState("");

  const iconRefs = useRef({});

  const [menuState, setMenuState] = useState({
    visible: false,
    list: null,
    anchorKey: null,
  });

  useEffect(() => {
    navigation.setOptions({
      title: "Shopping Lists",
      headerTitleAlign: "center",
      headerShadowVisible: true,
    });
  }, [navigation]);

  // ---------- helpers ----------

  const buildTodayListName = () => {
    const today = new Date();
    const baseName = today.toISOString().slice(0, 10);

    const allNames = [...activeLists, ...archivedLists].map((l) =>
      String(l.name || "").trim(),
    );

    if (!allNames.includes(baseName)) return baseName;

    let i = 2;
    while (allNames.includes(`${baseName}-${i}`)) i++;
    return `${baseName}-${i}`;
  };

  // ---------- actions ----------

  const handleAddList = () => {
    const name = buildTodayListName();
    createList(name, DEFAULT_CURRENCY);
  };

  const openEditName = (list) => {
    setEditingList(list);
    setEditName(list.name || "");
  };

  const handleConfirmRename = () => {
    const name = editName.trim();
    if (!name || !editingList) return;

    updateList(editingList.id, { name });
    setEditingList(null);
    setEditName("");
  };

  const handleOpenList = (listId) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId });
  };

  const openContextMenu = (list, key) => {
    setMenuState({
      visible: true,
      list,
      anchorKey: key,
    });
  };

  // ---------- render item ----------

  const renderItem = ({ item }) => {
    const currency = item.currency ?? DEFAULT_CURRENCY;

    return (
      <Pressable style={styles.card} onPress={() => handleOpenList(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <CurrencyBadge currency={currency} size="sm" />
          </View>

          <Pressable
            ref={(ref) => (iconRefs.current[item.id] = ref)}
            onPress={() => openContextMenu(item, item.id)}
            hitSlop={8}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#555" />
          </Pressable>
        </View>

        <Text style={styles.date}>
          Creada el {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        <Text style={styles.count}>{item.items?.length || 0} productos</Text>
      </Pressable>
    );
  };

  const sortedActiveLists = [...activeLists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={styles.container}
      >
        <FlatList
          data={sortedActiveLists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <Text style={styles.listHeader}>Mis listas</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        />
        {/* CONTEXT MENU */}
        <ContextMenu
          visible={menuState.visible}
          anchorRef={{
            current: iconRefs.current[menuState.anchorKey],
          }}
          onClose={() =>
            setMenuState({ visible: false, list: null, anchorKey: null })
          }
          items={[
            {
              label: "Editar nombre",
              onPress: () => openEditName(menuState.list),
            },
            {
              label: "Archivar",
              onPress: () => {
                archiveList(menuState.list.id);
                navigation.navigate(ROUTES.ARCHIVED_LISTS);
              },
            },
            {
              label: "Eliminar",
              destructive: true,
              onPress: () => deleteList(menuState.list.id),
            },
          ]}
        />
        {/* FAB */}
        <Pressable
          style={[styles.fab, { bottom: Math.max(16, insets.bottom + 8) }]}
          onPress={handleAddList}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </Pressable>
        {/* EDIT MODAL */}
        {editingList && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Editar nombre</Text>

              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setEditingList(null)}
                  style={styles.modalCancel}
                >
                  <Text>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmRename}
                  style={styles.modalConfirm}
                >
                  <Text style={{ color: "#fff" }}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BFD7FF",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
  },

  date: {
    fontSize: 13,
    color: "#6B7280",
  },

  count: {
    fontSize: 13,
    color: "#6B7280",
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#888",
  },

  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  modalCancel: {
    padding: 10,
  },

  modalConfirm: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
  },
});
