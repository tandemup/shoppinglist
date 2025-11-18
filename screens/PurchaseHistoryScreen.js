// screens/PurchaseHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";
import { getPurchases, deletePurchase } from "../utils/storageHelpers";

export default function PurchaseHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const purchases = await getPurchases();
    const ordered = purchases.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setHistory(ordered);
  };

  useEffect(() => {
    loadHistory();
    const unsub = navigation.addListener("focus", loadHistory);
    return unsub;
  }, [navigation]);

  const openPurchase = (purchase) => {
    navigation.navigate("PurchaseDetailScreen", { purchase });
  };

  const confirmDelete = (id) => {
    safeAlert("Eliminar compra", "¿Deseas borrar este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deletePurchase(id);
          loadHistory();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => openPurchase(item)}>
      <MaterialCommunityIcons
        name="receipt"
        size={30}
        color="#333"
        style={{ marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.store}>🛍️ {item.store}</Text>
        <Text style={styles.count}>{item.items.length} productos</Text>
      </View>

      <Pressable onPress={() => confirmDelete(item.id)}>
        <MaterialCommunityIcons name="delete" size={26} color="#c00" />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <Text style={styles.empty}>No hay compras guardadas aún.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  empty: { color: "#888", marginTop: 20, textAlign: "center" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f2f4f6",
    borderRadius: 12,
    marginBottom: 10,
  },

  date: { color: "#444", fontSize: 14 },
  store: { fontSize: 16, fontWeight: "bold" },
  count: { fontSize: 13, color: "#666" },
});
