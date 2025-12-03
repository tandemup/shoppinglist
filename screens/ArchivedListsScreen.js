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

  // -------- FILTRO + ORDEN --------
  const filtered = archivedLists
    .filter(
      (l) =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        formatStore(l.store)?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

  const openDetails = (list) => {
    navigation.navigate("ArchivedListDetail", { list });
  };

  // -------- ITEM DEL LISTADO --------
  const renderItem = ({ item }) => {
    const items = item.items || [];

    const total = items.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
      0
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.name}</Text>

          {/* Fecha */}
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color="#555" />
            <Text style={styles.cardText}>
              {new Date(item.archivedAt || item.createdAt).toLocaleDateString(
                "es-ES",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </Text>
          </View>

          {/* Tienda */}
          {item.store ? (
            <View style={styles.row}>
              <Ionicons name="location-outline" size={16} color="#555" />
              <Text style={styles.cardText}>{formatStore(item.store)}</Text>
            </View>
          ) : null}

          {/* Nº productos */}
          <View style={styles.row}>
            <Ionicons name="cart-outline" size={16} color="#555" />
            <Text style={styles.cardText}>{items.length} productos</Text>
          </View>

          {/* Total */}
          <View style={styles.row}>
            <Ionicons name="cash-outline" size={16} color="#16a34a" />
            <Text style={styles.total}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={22} color="#888" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listas Archivadas</Text>

      {/* 
      Aquí puedes colocar tu barra de búsqueda si la tienes:
      <SearchBar value={search} onChangeText={setSearch} />
      */}

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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardLeft: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },

  cardText: {
    fontSize: 14,
    color: "#555",
    flexShrink: 1,
  },

  total: {
    fontSize: 15,
    color: "#16a34a",
    fontWeight: "600",
  },
});
