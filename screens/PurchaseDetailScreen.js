// screens/PurchaseDetailScreen.js
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";
import { createList } from "../utils/listStorage";

export default function PurchaseDetailScreen({ route, navigation }) {
  const { purchase } = route.params;

  if (!purchase) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#888" }}>No se pudo cargar la compra.</Text>
      </View>
    );
  }

  // ---------------------------
  // TOTAL CALCULADO
  // ---------------------------
  const total = useMemo(() => {
    return purchase.items
      .reduce((acc, item) => {
        const p = item.priceInfo || {};
        const n =
          p.total ?? parseFloat(p.unitPrice || 0) * parseFloat(p.qty || 1);

        return acc + (isNaN(n) ? 0 : n);
      }, 0)
      .toFixed(2);
  }, [purchase.items]);

  // ---------------------------
  // RECREAR LISTA A PARTIR DE ESTA COMPRA
  // ---------------------------
  const recreateList = async () => {
    safeAlert(
      "Recrear lista",
      "¿Deseas crear una nueva lista con los productos de esta compra?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Crear lista",
          style: "destructive",
          onPress: async () => {
            const newList = await createList(
              "Recreada • " + purchase.store,
              purchase.store
            );

            // Items nuevos (con nuevos IDs)
            const clonedItems = purchase.items.map((item) => ({
              ...item,
              id: Math.random().toString(36).slice(2), // nuevo ID simple
              checked: false,
            }));

            newList.items = clonedItems;

            safeAlert(
              "Lista creada",
              "La nueva lista se ha generado correctamente."
            );

            navigation.navigate("ShoppingListScreen", {
              listId: newList.id,
            });
          },
        },
      ]
    );
  };

  // ---------------------------
  // ITEM UI
  // ---------------------------
  const renderItem = ({ item }) => {
    const p = item.priceInfo;

    return (
      <View style={styles.item}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>

          {p?.summary ? (
            <Text style={styles.detail}>{p.summary}</Text>
          ) : (
            <Text style={styles.detail}>
              {p.qty} × {p.unitPrice.toFixed(2)} €/ {p.unitType} ={" "}
              {p.total.toFixed(2)} €
            </Text>
          )}
        </View>

        <Text style={styles.itemPrice}>{p.total.toFixed(2)} €</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.container}>
        {/* CABECERA */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Compra en {purchase.store}</Text>

          <View style={{ width: 26 }} />
        </View>

        <Text style={styles.date}>{purchase.date}</Text>

        {/* TOTAL */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total gastado</Text>
          <Text style={styles.totalValue}>{total} €</Text>
        </View>

        {/* LISTA DE PRODUCTOS */}
        <FlatList
          data={purchase.items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        {/* BOTÓN RECREAR LISTA */}
        <TouchableOpacity style={styles.recreateBtn} onPress={recreateList}>
          <Text style={styles.recreateText}>Recrear esta lista 🧾</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------
// ESTILOS
// ---------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  date: { color: "#555", marginBottom: 14 },

  totalBox: {
    backgroundColor: "#E3F2FD",
    padding: 14,
    borderRadius: 12,
    borderColor: "#BBDEFB",
    borderWidth: 1,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16, color: "#333" },
  totalValue: { fontSize: 32, fontWeight: "bold", marginTop: 4 },

  item: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  itemName: { fontSize: 16, fontWeight: "600", color: "#111" },
  detail: { color: "#777", fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: "700", marginLeft: 10 },

  recreateBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  recreateText: { color: "white", fontWeight: "700", fontSize: 16 },
});
