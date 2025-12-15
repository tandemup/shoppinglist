// ArchivedListsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import { ROUTES } from "../navigation/ROUTES";

import { useStore } from "../context/StoreContext";
import { Ionicons } from "@expo/vector-icons";
import { formatStore } from "../utils/formatStore";

export default function ArchivedListsScreen({ navigation }) {
  const { archivedLists, reload } = useStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    reload();

    const unsub = navigation.addListener("focus", () => {
      reload();
    });

    return unsub;
  }, [navigation]);

  const filtered = archivedLists
    .filter((l) => {
      const q = search.toLowerCase();
      return (
        l.name?.toLowerCase().includes(q) ||
        formatStore(l.store)?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

  const openDetails = (list) => {
    navigation.navigate(ROUTES.ARCHIVED_LIST_DETAIL, { list });
  };

  const openStore = (store) => {
    if (!store) return;

    navigation.navigate(ROUTES.TIENDAS, {
      store: store,
      from: "archivedLists",
    });
  };

  // ────────────────────────────────────────────────
  // COMPONENTES INTERNOS
  // ────────────────────────────────────────────────
  const HeaderRow = ({ title, onPress }) => (
    <View style={styles.topRow}>
      <Text style={styles.itemname}>{title}</Text>

      <TouchableOpacity onPress={onPress} hitSlop={8}>
        <Ionicons name="chevron-forward" size={22} color="#555" />
      </TouchableOpacity>
    </View>
  );

  const InfoRow = ({ archivedAt, store }) => (
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

      <TouchableOpacity
        style={styles.storeLink}
        onPress={() => openStore(store)}
        activeOpacity={0.6}
        hitSlop={8}
      >
        <Ionicons name="location-outline" size={16} color="#2563eb" />
        <Text style={styles.storeText}>
          {store ? formatStore(store) : "Sin tienda"}
        </Text>
      </TouchableOpacity>
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

  const ArchivedListCard = ({ list }) => {
    const items = list.items || [];

    const total = items.reduce(
      (sum, it) => sum + (it.priceInfo?.total ?? it.price ?? 0),
      0
    );

    return (
      <View style={styles.card}>
        <HeaderRow title={list.name} onPress={() => openDetails(list)} />

        <InfoRow
          archivedAt={list.archivedAt || list.createdAt}
          store={list.store}
        />

        <View style={styles.separator} />

        <ProductsAndTotalRow count={items.length} total={total} />
      </View>
    );
  };

  // RENDER ITEM AHORA ES SÚPER LIMPIO
  const renderItem = ({ item }) => <ArchivedListCard list={item} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listas Archivadas</Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  storeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  storeText: {
    fontSize: 14,
    color: "#2563eb", // azul link
    fontWeight: "500",
  },
});
