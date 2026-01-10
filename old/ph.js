// PurchaseHistoryScreen.js — Versión para mostrar productos individuales
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";

import { useStore } from "../context/StoreContext";
import BarcodeLink from "../components/BarcodeLink";

export default function PurchaseHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const { purchaseHistory, reload } = useStore();

  // Cargar historial al entrar
  useEffect(() => {
    reload();

    const unsub = navigation.addListener("focus", () => {
      reload();
    });

    return unsub;
  }, [navigation]);

  // Convertimos el historial en una lista plana para mostrar productos
  useEffect(() => {
    if (!purchaseHistory) return;

    // Cada entrada dentro de purchaseHistory ya es un producto individual
    setItems(
      [...purchaseHistory].sort((a, b) =>
        (b.purchasedAt ?? "").localeCompare(a.purchasedAt ?? "")
      )
    );
  }, [purchaseHistory]);

  // ---------------------------------------------
  // FILTRO
  // ---------------------------------------------
  const visible = items.filter((i) =>
    `${i.name} ${i.store ?? ""} ${i.barcode ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ---------------------------------------------
  // CARD DEL PRODUCTO INDIVIDUAL
  // ---------------------------------------------
  const ProductCard = ({ item }) => {
    const date = dayjs(item.purchasedAt).format("D MMM YYYY");
    const qty = item.priceInfo?.qty ?? 1;
    const unit = item.priceInfo?.unitType ?? "u";
    const unitPrice = item.priceInfo?.unitPrice ?? null;

    return (
      <Pressable style={styles.card}>
        {/* FECHA */}
        <Text style={styles.dateText}>{date}</Text>

        {/* NOMBRE */}
        <Text style={styles.productName}>{item.name}</Text>

        {/* TIENDA */}
        {item.store ? (
          <View style={styles.storeRow}>
            <Ionicons name="storefront-outline" size={16} color="#6B7280" />
            <Text style={styles.storeText}>{item.store}</Text>
          </View>
        ) : null}

        {/* CÓDIGO DE BARRAS */}
        {item.barcode ? (
          <View style={{ marginTop: 6 }}>
            <BarcodeLink barcode={item.barcode} label="Código:" />
          </View>
        ) : null}

        {/* CANTIDAD Y PRECIO UNITARIO */}
        <View style={{ marginTop: 6 }}>
          <Text style={styles.unitInfo}>
            {qty} {unit}
            {unitPrice != null && ` • ${unitPrice.toFixed(2)} €/ ${unit}`}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Compras</Text>

      <TextInput
        placeholder="Buscar producto, tienda o código…"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

// --------------------------------------------------
// ESTILOS
// --------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  header: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  dateText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },

  productName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },

  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  storeText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#4B5563",
  },

  unitInfo: {
    fontSize: 14,
    color: "#374151",
  },
});
