// screens/PurchaseHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";

import { getPurchases, deletePurchase } from "../utils/storage/purchaseHistory";

export default function PurchaseHistoryScreen({ navigation }) {
  const [purchases, setPurchases] = useState([]);

  const load = async () => {
    const data = await getPurchases();
    setPurchases(data);
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    return unsub;
  }, [navigation]);

  const handleDelete = async (id) => {
    await deletePurchase(id);
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>

      <Pressable
        style={styles.deleteBtn}
        onPress={() =>
          safeAlert("Confirmar eliminación", "¿Quieres eliminar esta compra?", [
            { text: "Cancelar" },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: () => handleDelete(item.id),
            },
          ])
        }
      >
        <MaterialCommunityIcons name="delete" size={22} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de compras</Text>

      {purchases.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: "#666" }}>No hay compras registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id}
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateText: {
    color: "#666",
    marginTop: 4,
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: "#e11d48",
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
});
