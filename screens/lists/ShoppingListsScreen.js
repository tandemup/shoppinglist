import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useLists } from "../../context/ListsContext";
import { ROUTES } from "../../navigation/ROUTES";
import { DEFAULT_CURRENCY } from "../../constants/currency";
import FabMenu from "../../components/ui/FabMenu";
import CurrencyBadge from "../../components/ui/CurrencyBadge";

import {
  safeAlert,
  safeMenu,
  safeConfirm,
} from "../../components/ui/alert/safeAlert";

function MenuNavegacion1() {
  const navigation = useNavigation();

  const Row = ({ icon, label, route }) => (
    <TouchableOpacity
      style={styles1.nav1Row}
      onPress={() =>
        navigation.navigate(ROUTES.SHOPPING_TAB, {
          screen: route,
        })
      }
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#2563eb"
        style={styles1.nav1RowIcon}
      />
      <Text style={styles1.nav1RowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles1.nav1Wrapper}>
      <Text style={styles1.nav1Title}>Navegación</Text>

      <Row
        icon="list-outline"
        label="Mis listas"
        route={ROUTES.SHOPPING_LISTS}
      />
      <Row
        icon="archive-outline"
        label="Listas archivadas"
        route={ROUTES.ARCHIVED_LISTS}
      />
      <Row
        icon="receipt-outline"
        label="Historial de compras"
        route={ROUTES.PURCHASE_HISTORY}
      />
      <Row
        icon="barcode-outline"
        label="Historial de escaneos"
        route={ROUTES.SCANNED_HISTORY}
      />
    </View>
  );
}

function MenuNavegacion2({
  archivedCount = 0,
  historyCount = 0,
  scannedCount = 0,
}) {
  const navigation = useNavigation();

  const actions = [
    {
      key: "lists",
      label: "Mis Listas",
      icon: "list-outline",
      route: ROUTES.SHOPPING_LISTS,
    },
    {
      key: "archived",
      label: "Archivadas",
      icon: "archive-outline",
      route: ROUTES.ARCHIVED_LISTS,
      badge: archivedCount,
    },
    {
      key: "history",
      label: "Compras",
      icon: "receipt-outline",
      route: ROUTES.PURCHASE_HISTORY,
      badge: historyCount,
    },
    {
      key: "scanned",
      label: "Escaneos",
      icon: "barcode-outline",
      route: ROUTES.SCANNED_HISTORY,
      badge: scannedCount,
    },
  ];

  return (
    <View style={styles2.quickWrapper}>
      <Text style={styles2.quickTitle}>Accesos rápidos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles2.quickScroll}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={() =>
              navigation.navigate(ROUTES.SHOPPING_TAB, { screen: action.route })
            }
            style={({ pressed }) => [
              styles2.quickCard,
              pressed && styles2.quickCardPressed,
            ]}
          >
            <View style={styles2.quickIconBox}>
              <Ionicons name={action.icon} size={22} color="#2563eb" />

              {action.badge > 0 && (
                <View style={styles2.quickBadge}>
                  <Text style={styles2.quickBadgeText}>
                    {action.badge > 99 ? "99+" : action.badge}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles2.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
export default function ShoppingListsScreen() {
  const navigation = useNavigation();
  const listRef = useRef(null);

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

  useEffect(() => {
    navigation.setOptions({
      title: "Shopping Lists",
      headerTitleAlign: "center",
      headerShadowVisible: true,
    });
  }, [navigation]);

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

  const handleAddList = () => {
    const name = buildTodayListName();
    createList(name, DEFAULT_CURRENCY);
  };

  const fabActions = [
    {
      key: "new",
      icon: "add",
      label: "Nueva lista",
      onPress: handleAddList,
    },
    {
      key: "archived",
      icon: "archive",
      label: "Archivadas",
      onPress: () => navigation.navigate(ROUTES.ARCHIVED_LISTS),
    },
    {
      key: "purchases",
      icon: "receipt",
      label: "Compras",
      onPress: () => navigation.navigate(ROUTES.PURCHASE_HISTORY),
    },
    {
      key: "scanned",
      icon: "barcode",
      label: "Escaneos",
      onPress: () => navigation.navigate(ROUTES.SCANNED_HISTORY),
    },
  ];

  const handleOpenList = (listId) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId });
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

  const openListMenu = (list) => {
    safeMenu("Opciones de la lista", list?.name || "", [
      {
        text: "Editar nombre",
        onPress: () => {
          requestAnimationFrame(() => {
            openEditName(list);
          });
        },
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
        onPress: () => {
          safeAlert(
            "Eliminar lista",
            `¿Seguro que quieres eliminar "${list.name}"?`,
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Eliminar",
                style: "destructive",
                onPress: () => deleteList(list.id),
              },
            ],
          );
        },
      },
      { text: "Cancelar", style: "cancel", onPress: () => {} },
    ]);
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

          <Pressable onPress={() => openListMenu(item)} hitSlop={8}>
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
    <View style={styles.screen}>
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <MenuNavegacion2 />

        <FlatList
          ref={listRef}
          data={sortedActiveLists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              <Text style={styles.listHeader}>Mis Listas</Text>
            </>
          }
          ListEmptyComponent={
            <>
              <Text style={styles.emptyText}>No tienes listas activas 😊</Text>
              <Text style={styles.emptyHint}>
                Pulsa + para crear tu primera lista
              </Text>
            </>
          }
          contentContainerStyle={{
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 120,
          }}
        />

        <FabMenu actions={fabActions} />

        <Modal transparent visible={!!editingList} animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setEditingList(null);
              setEditName("");
            }}
          >
            <Pressable
              style={styles.modalCard}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Editar nombre</Text>

              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onSubmitEditing={handleConfirmRename}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => {
                    setEditingList(null);
                    setEditName("");
                  }}
                  style={styles.modalCancel}
                >
                  <Text>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirmRename}
                  style={[
                    styles.modalConfirm,
                    !editName.trim() && { opacity: 0.5 },
                  ]}
                  disabled={!editName.trim()}
                >
                  <Text style={{ color: "#fff" }}>Guardar</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles1 = StyleSheet.create({
  nav1Wrapper: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  nav1Title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },

  nav1Row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#BFD7FF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  nav1RowIcon: {
    marginRight: 12,
  },

  nav1RowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
});

const styles2 = StyleSheet.create({
  quickWrapper: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },

  quickScroll: {
    paddingBottom: 4,
  },

  quickCard: {
    width: 104,
    minHeight: 92,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BFD7FF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  quickCardPressed: {
    opacity: 0.8,
  },

  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  quickBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },

  quickBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  quickLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  safeArea: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#374151",
  },

  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
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

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#888",
    fontSize: 15,
  },

  emptyHint: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 6,
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
    flex: 1,
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
