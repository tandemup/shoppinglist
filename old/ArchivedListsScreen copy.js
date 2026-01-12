import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../navigation/ROUTES";

import { useLists } from "../context/ListsContext";
import { useStores } from "../context/StoresContext";
import { formatStore } from "../utils/store/formatters";

export function StoreSearchLink({
  store,
  onPressStore,
  iconColor = "#2563eb",
  textStyle,
}) {
  if (!store) {
    return <Text style={[{ color: "#999" }, textStyle]}>Sin tienda</Text>;
  }

  const handlePress = () => {
    if (onPressStore) {
      onPressStore(store.id);
      return;
    }

    const query = encodeURIComponent(store.name);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      hitSlop={8}
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
    >
      <Ionicons name="location-outline" size={16} color={iconColor} />
      <Text
        style={[
          { color: iconColor, fontSize: 14, fontWeight: "500" },
          textStyle,
        ]}
      >
        {store.name}
      </Text>
    </TouchableOpacity>
  );
}

export const HeaderRow = ({ title, onPress }) => (
  <View style={styles.topRow}>
    <Text style={styles.itemname}>{title}</Text>

    <TouchableOpacity onPress={onPress} hitSlop={8}>
      <Ionicons name="chevron-forward" size={22} color="#555" />
    </TouchableOpacity>
  </View>
);

export const InfoRow = ({ archivedAt, store, onPressStore }) => (
  <View style={styles.iconRow}>
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
    <Text style={styles.price}>{total.toFixed(2)} €</Text>
  </View>
);

/* ────────────────────────────────────────────────
   ITEM ROW (expandido)
   name
   quantity
   barcode
   onPress
   priceInfo
──────────────────────────────────────────────── */

const ArchivedItemRow1 = ({ item }) => {
  const price =
    item.priceInfo?.total ?? item.price ?? item.priceInfo?.unit ?? 0;

  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>

        {item.quantity ? (
          <Text style={styles.itemMeta}>x{item.quantity}</Text>
        ) : null}

        {item.barcode ? (
          <TouchableOpacity
            onPress={() =>
              window?.open?.(
                `https://www.google.com/search?q=${encodeURIComponent(
                  item.barcode
                )}`,
                "_blank"
              )
            }
          >
            <Text style={styles.barcode}>🔎 {item.barcode}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.itemPrice}>{price.toFixed(2)} €</Text>
    </View>
  );
};

const ArchivedItemRow = ({ item }) => {
  const quantity = item.quantity ?? 1;
  const unitPrice = item.priceInfo?.unit ?? item.price ?? 0;
  const total = item.priceInfo?.total ?? unitPrice * quantity;

  return (
    <TouchableOpacity
      style={styles.itemCell}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>

        <Text style={styles.itemMeta}>
          {item.unit ?? ""} · x{quantity}
        </Text>

        {item.barcode && <Text style={styles.barcode}>🔎 {item.barcode}</Text>}
      </View>

      <View style={styles.priceCol}>
        <Text style={styles.unitPrice}>{unitPrice.toFixed(2)} € / ud</Text>
        <Text style={styles.totalPrice}>{total.toFixed(2)} €</Text>
      </View>
    </TouchableOpacity>
  );
};

const ArchivedListCard = ({ list, store, onPressDetails, onPressStore }) => {
  const [expanded, setExpanded] = useState(false);
  const items = list.items || [];
  const total = items.reduce(
    (sum, it) => sum + (it.priceInfo?.total ?? it.price ?? 0),
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
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setExpanded((v) => !v)}
      >
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

export default function ArchivedListsScreen({ navigation }) {
  const { archivedLists } = useLists();
  const { getStoreById } = useStores();

  const [search, setSearch] = useState("");

  const filtered = (archivedLists ?? [])
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        l.name?.toLowerCase().includes(q) ||
        formatStore(l.store)?.toLowerCase().includes(q)
      );
    })
    .sort(
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
    if (!storeId) return;

    navigation.navigate(ROUTES.STORES_TAB, {
      screen: ROUTES.STORES_HOME,
      params: { storeId, from: "archivedLists" },
    });
  };

  const renderItem = ({ item }) => {
    const store = item.storeId ? getStoreById(item.storeId) : null;

    return (
      <ArchivedListCard
        list={item}
        store={store}
        onPressDetails={() => openDetails(item)}
        onPressStore={(storeId) => openStore(storeId)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listas Archivadas</Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id ?? `archived-list-${index}`}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F2F3F7" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
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

  itemname: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  subInfo: { fontSize: 14, color: "#666", flexShrink: 1 },
  dot: { color: "#aaa" },

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

  productsText: { fontSize: 15, color: "#444" },
  price: { fontSize: 20, fontWeight: "700", color: "#16a34a" },

  expandButton: {
    marginTop: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  expandText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },

  itemsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingTop: 8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },

  itemMeta: {
    fontSize: 13,
    color: "#666",
  },

  barcode: {
    fontSize: 13,
    color: "#2563eb",
    marginTop: 2,
  },

  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  itemCell: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
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

  priceCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minWidth: 90,
  },

  unitPrice: {
    fontSize: 12,
    color: "#666",
  },

  totalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
  },
});
