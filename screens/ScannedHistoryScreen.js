// screens/ScannedHistoryScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import dayjs from "dayjs";
import {
  getScannedHistory,
  deleteScannedItem,
} from "../utils/storage/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getScannedHistory();

    // Ordenar por fecha (más reciente arriba)
    const sorted = data.sort((a, b) => b.ts - a.ts);
    setItems(sorted);
  };

  // 🗑 Borrar un item del historial
  const handleDelete = async (code) => {
    await deleteScannedItem(code);
    await loadItems(); // refrescamos la lista
  };

  // 🔍 Filtro SearchBar
  const filteredItems = items.filter((item) => {
    const text = query.toLowerCase();
    return (
      item.name?.toLowerCase().includes(text) ||
      item.brand?.toLowerCase().includes(text) ||
      item.code?.toLowerCase().includes(text)
    );
  });

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.isBook && styles.bookCard]}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => navigation.navigate("EditScannedItem", { item })}
      >
        <Text style={styles.name}>{item.name || "Sin nombre"}</Text>
        <Text style={styles.brand}>{item.brand || "Sin marca"}</Text>

        <Text style={styles.code}>Código: {item.code}</Text>

        {item.count > 1 && (
          <Text style={styles.count}>Escaneado {item.count} veces</Text>
        )}

        <Text style={styles.date}>
          {dayjs(item.ts).format("DD/MM/YYYY HH:mm")}
        </Text>
      </TouchableOpacity>

      {/* BOTÓN BORRAR */}
      <TouchableOpacity
        onPress={() => handleDelete(item.code)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteText}>Borrar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre, marca o código..."
        value={query}
        onChangeText={setQuery}
      />

      {/* Lista con scroll */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#f7f7f7" },

  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ⭐ Azul claro para libros
  bookCard: {
    backgroundColor: "#E6F0FF",
    borderLeftWidth: 4,
    borderLeftColor: "#4A90E2",
  },

  name: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  brand: { fontSize: 14, color: "#666" },
  code: { marginTop: 6, fontSize: 13, color: "#333" },
  count: { marginTop: 4, fontSize: 12, color: "#666" },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
  },

  // ❌🗑 Botón BORRAR
  deleteButton: {
    backgroundColor: "#ffebee",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteText: {
    color: "#c62828",
    fontWeight: "600",
  },
});
