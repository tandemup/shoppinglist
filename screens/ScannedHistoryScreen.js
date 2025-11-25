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
import { getScannedHistory } from "../utils/storage/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const data = await getScannedHistory();

    // Ordenar por timestamp (ts) descendente
    const sorted = data.sort((a, b) => b.ts - a.ts);
    setItems(sorted);
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
    <TouchableOpacity
      style={styles.card}
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
  },

  name: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  brand: { fontSize: 14, color: "#666" },
  code: { marginTop: 6, fontSize: 13, color: "#333" },
  count: { marginTop: 4, fontSize: 12, color: "#666" },

  date: {
    marginTop: 8,
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
});
