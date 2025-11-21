// screens/ScannedHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";

import {
  getScannedHistory,
  deleteScannedEntry,
} from "../utils/storage/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const loadHistory = async () => {
    const data = await getScannedHistory();
    setItems(data);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadHistory);
    return unsub;
  }, [navigation]);

  const handleDelete = async (code) => {
    await deleteScannedEntry(code);
    loadHistory();
  };

  const handleEdit = (item) => {
    navigation.navigate("EditScannedItemScreen", { item });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.code}>Código: {item.code}</Text>
      <Text style={styles.count}>Veces escaneado: {item.count}</Text>
      <Text style={styles.date}>
        Último escaneo: {new Date(item.ts).toLocaleString()}
      </Text>

      {/* Mostrar metadatos si existen */}
      {item.name ? <Text>Nombre: {item.name}</Text> : null}
      {item.brand ? <Text>Marca: {item.brand}</Text> : null}
      {item.url ? <Text>URL: {item.url}</Text> : null}

      <View style={styles.row}>
        <Pressable style={styles.editBtn} onPress={() => handleEdit(item)}>
          <Text style={styles.editBtnText}>Editar</Text>
        </Pressable>

        <Pressable
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.code)}
        >
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de escaneos</Text>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay escaneos registrados.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FAFAFA" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#888" },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },

  code: { fontSize: 16, fontWeight: "bold" },
  count: { marginTop: 4 },
  date: { marginTop: 4, color: "#666", fontSize: 12 },

  row: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },

  editBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editBtnText: { color: "white", fontWeight: "bold" },

  deleteBtn: {
    backgroundColor: "#e11d48",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteBtnText: { color: "white", fontWeight: "bold" },
});
