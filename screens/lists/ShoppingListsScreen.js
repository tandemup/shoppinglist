import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { safeAlert } from "../../utils/core/safeAlert";
import { useLists } from "../../context/ListsContext";
import { ROUTES } from "../../navigation/ROUTES";
import { DEFAULT_CURRENCY } from "../../constants/currency";
import CurrencyBadge from "../../components/CurrencyBadge";

export default function ShoppingListsScreen() {
  const navigation = useNavigation();

  const {
    activeLists = [],
    archivedLists = [],
    createList,
    deleteList,
    archiveList,
  } = useLists();

  const [contextMenu, setContextMenu] = React.useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: "Shopping Lists",
      headerTitleAlign: "center",
      headerShadowVisible: true,
    });
  }, [navigation]);

  const buildTodayListName = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const baseName = `${yyyy}-${mm}-${dd}`;

    const allNames = [...activeLists, ...archivedLists].map((list) =>
      String(list.name || "").trim(),
    );

    if (!allNames.includes(baseName)) {
      return baseName;
    }

    let suffix = 2;
    while (allNames.includes(`${baseName}-${suffix}`)) {
      suffix += 1;
    }

    return `${baseName}-${suffix}`;
  };

  const handleAddList = () => {
    const listName = buildTodayListName();
    createList(listName, DEFAULT_CURRENCY);
  };

  const handleOpenList = (listId) => {
    if (!activeLists.find((l) => l.id === listId)) return;
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId });
  };

  const openContextMenu = (list, event) => {
    if (Platform.OS === "web") {
      if (!event?.currentTarget) return;

      const rect = event.currentTarget.getBoundingClientRect();

      setContextMenu({
        list,
        x: rect.right - 160,
        y: rect.bottom + 6,
      });
    } else {
      safeAlert(
        "Opciones de la lista",
        `¿Qué deseas hacer con "${list.name}"?`,
        [
          {
            text: "Editar",
            onPress: () => {},
          },
          {
            text: "Archivar",
            onPress: () => {
              archiveList(list.id);
              navigation.navigate(ROUTES.ARCHIVED_LISTS);
            },
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => deleteList(list.id),
          },
          {
            text: "Cancelar",
            style: "cancel",
          },
        ],
      );
    }
  };

  const renderItem = ({ item }) => {
    const currency = item.currency ?? DEFAULT_CURRENCY;

    return (
      <Pressable style={styles.card} onPress={() => handleOpenList(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <CurrencyBadge currency={currency} size="sm" />
          </View>

          <Pressable onPress={(e) => openContextMenu(item, e)} hitSlop={8}>
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mis Listas</Text>

      <View style={styles.createRow}>
        <Pressable style={styles.createButton} onPress={handleAddList}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.createButtonText}>Nueva lista de hoy</Text>
        </Pressable>
      </View>

      <FlatList
        data={sortedActiveLists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
        }
      />

      {contextMenu && Platform.OS === "web" && (
        <Pressable
          ref={overlayRef}
          style={styles.overlay}
          onPress={() => {
            overlayRef.current?.blur?.();
            setContextMenu(null);
          }}
        >
          <View
            style={[
              styles.contextMenu,
              { top: contextMenu.y, left: contextMenu.x },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                overlayRef.current?.blur?.();
                archiveList(contextMenu.list.id);
                setContextMenu(null);
                navigation.navigate(ROUTES.ARCHIVED_LISTS);
              }}
            >
              <Text style={styles.menuText}>Archivar</Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                overlayRef.current?.blur?.();
                deleteList(contextMenu.list.id);
                setContextMenu(null);
              }}
            >
              <Text style={[styles.menuText, { color: "#dc2626" }]}>
                Eliminar
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                overlayRef.current?.blur?.();
                setContextMenu(null);
              }}
            >
              <Text style={styles.menuText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    color: "#000",
  },

  createRow: {
    marginBottom: 20,
  },

  createButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },

  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
    marginBottom: 4,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },

  date: {
    fontSize: 13,
    color: "#6B7280",
  },

  count: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#888",
    fontSize: 14,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },

  contextMenu: {
    position: "fixed",
    backgroundColor: "#fff",
    borderRadius: 10,
    minWidth: 160,
    paddingVertical: 6,
    zIndex: 1000,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },

  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  menuText: {
    fontSize: 15,
    color: "#111",
  },
});
