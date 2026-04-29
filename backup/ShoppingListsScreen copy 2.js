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
import CurrencyBadge from "../../components/ui/CurrencyBadge";

import {
  safeAlert,
  safeMenu,
  safeConfirm,
} from "../../components/ui/alert/safeAlert";

function EditListNameModal() {}

function MenuNavegacion1({ onCreateList }) {
  const navigation = useNavigation();

  const Row = ({ icon, label, route, onPress }) => (
    <TouchableOpacity
      style={styles1.nav1Row}
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }

        navigation.navigate(ROUTES.SHOPPING_TAB, {
          screen: route,
        });
      }}
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

      <Row icon="add-outline" label="Nueva lista" onPress={onCreateList} />
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
  onCreateList,
}) {
  const navigation = useNavigation();

  const actions = [
    {
      key: "new",
      label: "Nueva lista",
      icon: "add-outline",
      onPress: onCreateList,
    },
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
            onPress={() => {
              if (action.onPress) {
                action.onPress();
                return;
              }

              navigation.navigate(ROUTES.SHOPPING_TAB, {
                screen: action.route,
              });
            }}
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

  const [editingList, setEditingList] = useState(undefined);
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
    setEditingList(null);
    setEditName(buildTodayListName());
  };

  const handleOpenList = (listId) => {
    navigation.navigate(ROUTES.SHOPPING_LIST, { listId });
  };

  const openEditName = (list) => {
    setEditingList(list);
    setEditName(list?.name || "");
  };

  const closeEditModal = () => {
    setEditingList(undefined);
    setEditName("");
  };

  const handleConfirmEditName = () => {
    const name = editName.trim();
    if (!name) return;

    if (editingList) {
      updateList(editingList.id, { name });
    } else {
      createList(name, DEFAULT_CURRENCY);
    }

    closeEditModal();
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
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleOpenList(item.id)}
      >
        <View style={styles.iconBox}>
          <Ionicons name="list-outline" size={28} color="#111827" />
        </View>

        <View style={styles.cardText}>
          <View style={styles.nameRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <CurrencyBadge currency={currency} size="sm" />
          </View>

          <Text style={styles.cardSubtitle}>
            Creada el {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          <Text style={styles.cardMeta}>
            {item.items?.length || 0} productos
          </Text>
        </View>

        <View style={styles.cardRight}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              openListMenu(item);
            }}
            hitSlop={8}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
          </Pressable>

          <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
        </View>
      </Pressable>
    );
  };

  const sortedActiveLists = [...activeLists].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Shopping Lists</Text>

          <Text style={styles.subtitle}>
            Crea, consulta y gestiona tus listas de compra activas.
          </Text>

          <MenuNavegacion2
            archivedCount={archivedLists.length}
            historyCount={0}
            scannedCount={0}
            onCreateList={handleAddList}
          />

          <FlatList
            ref={listRef}
            style={styles.list}
            data={sortedActiveLists}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={
              <Text style={styles.listHeader}>Mis listas</Text>
            }
            ListEmptyComponent={
              <>
                <Text style={styles.emptyText}>
                  No tienes listas activas 😊
                </Text>
                <Text style={styles.emptyHint}>
                  Pulsa “Nueva lista” para crear tu primera lista
                </Text>
              </>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>

        <Modal
          transparent
          visible={editingList !== undefined}
          animationType="fade"
        >
          ...
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
    marginBottom: 12,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  quickCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  quickIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "#EF4444",
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
    backgroundColor: "#F9FAFB",
  },

  safeArea: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 18,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },

  listHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 14,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardText: {
    flex: 1,
    paddingRight: 10,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  cardTitle: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  cardMeta: {
    fontSize: 14,
    color: "#6B7280",
  },

  cardRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    marginLeft: 8,
  },

  menuButton: {
    padding: 2,
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },

  emptyHint: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 6,
    fontSize: 14,
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
    color: "#111827",
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: "#111827",
    backgroundColor: "#fff",
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
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});
