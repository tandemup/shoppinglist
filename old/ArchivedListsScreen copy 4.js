import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../navigation/ROUTES";
import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";

/* ────────────────────────────────────────────────
   STORE LINK
──────────────────────────────────────────────── */

const StoreSearchLink = ({ store, onPressStore }) => {
  if (!store) {
    return <Text style={{ color: "#999" }}>Sin tienda</Text>;
  }

  const handlePress = () => {
    if (onPressStore) {
      onPressStore(store.id);
      return;
    }
    const q = encodeURIComponent(store.name);
    Linking.openURL(`https://www.google.com/search?q=${q}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={8}
      style={styles.storeLink}
    >
      <Ionicons name="location-outline" size={16} color="#2563eb" />
      <Text style={styles.storeText}>{store.name}</Text>
    </TouchableOpacity>
  );
};

/* ────────────────────────────────────────────────
   CARD HEADER
──────────────────────────────────────────────── */

const HeaderRow = ({ title, onPress }) => (
  <View style={styles.topRow}>
    <Text style={styles.listTitle}>{title}</Text>
    <TouchableOpacity onPress={onPress} hitSlop={8}>
      <Ionicons name="chevron-forward" size={22} color="#555" />
    </TouchableOpacity>
  </View>
);

const InfoRow = ({ archivedAt, store, onPressStore }) => (
  <View style={styles.infoRow}>
    <Ionicons name="calendar-outline" size={16} color="#777" />
    <Text style={styles.subInfo}>
      {new Date(archivedAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}
    </Text>
    <Text style={styles.dot}>•</Text>
    <StoreSearchLink store={store} onPressStore={onPressStore} />
  </View>
);

const ProductsAndTotalRow = ({ count, total }) => (
  <View style={styles.bottomRow}>
    <View style={styles.iconRow}>
      <Ionicons name="cart-outline" size={17} color="#777" />
      <Text style={styles.productsText}>{count} productos</Text>
    </View>
    <Text style={styles.totalPrice}>{total.toFixed(2)} €</Text>
  </View>
);

/* ────────────────────────────────────────────────
   ITEM ROW — DISEÑO B (COMPACTO)
──────────────────────────────────────────────── */

const ArchivedItemRow = ({ item }) => {
  const quantity = Number(item.quantity ?? 1);

  const unitPriceRaw =
    item.priceInfo?.unit ?? item.price ?? item.priceInfo?.price ?? 0;

  const unitPrice = Number(unitPriceRaw) || 0;
  const total = Number(item.priceInfo?.total) || unitPrice * quantity;

  const openBarcode = () => {
    if (!item.barcode) return;
    const q = encodeURIComponent(item.barcode);
    Linking.openURL(`https://www.google.com/search?q=${q}`);
  };

  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>

        <Text style={styles.itemMeta}>
          · x{quantity}
          {item.unit ? ` · ${item.unit}` : ""}
        </Text>

        {item.barcode && (
          <TouchableOpacity onPress={openBarcode}>
            <Text style={styles.barcode}>🔎 {item.barcode}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.itemPrice}>{total.toFixed(2)} €</Text>
    </View>
  );
};

/* ────────────────────────────────────────────────
   ARCHIVED LIST CARD
──────────────────────────────────────────────── */

const ArchivedListCard = ({
  list,
  store,
  expanded,
  onToggle,
  onPressDetails,
  onPressStore,
}) => {
  const items = list.items || [];

  const total = items.reduce(
    (sum, it) => sum + Number(it.priceInfo?.total ?? it.price ?? 0),
    0
  );

  return (
    <View style={styles.card}>
      <HeaderRow title={list.name} onPress={onPressDetails} />

      <InfoRow
        archivedAt={list.archivedAt || list.createdAt}
        store={store}
        onPressStore={onPressStore}
      />

      <View style={styles.separator} />

      <ProductsAndTotalRow count={items.length} total={total} />

      <TouchableOpacity style={styles.expandButton} onPress={onToggle}>
        <Text style={styles.expandText}>
          {expanded ? "Ocultar items ▲" : "Ver items ▼"}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.itemsContainer}>
          {items.map((item) => (
            <ArchivedItemRow key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
};

/* ────────────────────────────────────────────────
   SCREEN
──────────────────────────────────────────────── */

export default function ArchivedListsScreen({ navigation }) {
  const { archivedLists } = useLists();
  const { getStoreById } = useStores();

  const [expandedListId, setExpandedListId] = useState(null);

  const sorted = (archivedLists ?? []).sort(
    (a, b) =>
      new Date(b.archivedAt || b.createdAt) -
      new Date(a.archivedAt || a.createdAt)
  );

  const openDetails = (list) => {
    navigation.navigate(ROUTES.ARCHIVED_LIST_DETAIL, {
      listId: list.id,
    });
  };

  const openStore = (storeId) => {
    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_HOME,
      params: { storeId, from: "archivedLists" },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Listas Archivadas</Text>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        extraData={expandedListId}
        renderItem={({ item }) => (
          <ArchivedListCard
            list={item}
            store={item.storeId ? getStoreById(item.storeId) : null}
            expanded={expandedListId === item.id}
            onToggle={() =>
              setExpandedListId(expandedListId === item.id ? null : item.id)
            }
            onPressDetails={() => openDetails(item)}
            onPressStore={openStore}
          />
        )}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}

/* ────────────────────────────────────────────────
   STYLES — DISEÑO B
──────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F3F7",
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  subInfo: {
    fontSize: 14,
    color: "#666",
  },

  dot: {
    color: "#aaa",
  },

  storeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  storeText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },

  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 10,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  productsText: {
    fontSize: 15,
    color: "#444",
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },

  expandButton: {
    marginTop: 8,
    alignItems: "center",
  },

  expandText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },

  itemsContainer: {
    marginTop: 6,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  itemMeta: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  barcode: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 4,
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    marginLeft: 12,
  },
});
