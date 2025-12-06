// ArchivedListsScreen.js — Versión corregida

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useStore } from "../context/StoreContext";
import { Ionicons } from "@expo/vector-icons";
import { formatStore } from "../utils/formatStore";

export default function ArchivedListsScreen({ navigation }) {
  const { archivedLists } = useStore();
  const [search, setSearch] = useState("");

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
    navigation.navigate("ArchivedListDetail", { list });
  };

  const renderItem = ({ item }) => {
    const items = item.items || [];

    // TOTAL CORREGIDO
    const total = items.reduce(
      (sum, it) => sum + (it.priceInfo?.total ?? it.price ?? 0), // precio total real del item archivado
      0
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.topRow}>
          <Text style={styles.itemname}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
        </View>

        <View style={styles.iconRow}>
          <Ionicons name="calendar-outline" size={16} color="#777" />
          <Text style={styles.subInfo}>
            {new Date(item.archivedAt || item.createdAt).toLocaleDateString(
              "es-ES",
              { day: "numeric", month: "short", year: "numeric" }
            )}
          </Text>

          <Text style={styles.dot}>•</Text>

          <Ionicons name="location-outline" size={16} color="#777" />
          <Text style={styles.subInfo}>
            {item.store ? formatStore(item.store) : "Sin tienda"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.bottomRow}>
          <View style={styles.iconRow}>
            <Ionicons name="cart-outline" size={17} color="#777" />
            <Text style={styles.productsText}>{items.length} productos</Text>
          </View>

          <Text style={styles.price}>{total.toFixed(2)} €</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
});
