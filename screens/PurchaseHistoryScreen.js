// PurchaseHistoryScreen.js — Variante B limpia y final

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BarcodeLink from "../components/BarcodeLink";
import { useStore } from "../context/StoreContext";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function PurchaseHistoryScreen({ navigation }) {
  const { purchaseHistory, fetchLists } = useStore();
  const [search, setSearch] = useState("");

  // Header con menú
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </Pressable>
      ),
    });
  }, [navigation]);

  // Recargar historial al entrar
  useEffect(() => {
    fetchLists();
  }, []);

  // Filtro
  const filtered = purchaseHistory.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.barcode?.toLowerCase().includes(q) ||
      item.store?.toLowerCase().includes(q) ||
      item.listName?.toLowerCase().includes(q)
    );
  });

  // Agrupar por fecha
  const grouped = filtered.reduce((acc, item) => {
    const date = dayjs(item.purchasedAt).format("YYYY-MM-DD");
    (acc[date] = acc[date] || []).push(item);
    return acc;
  }, {});

  const sortedSections = Object.keys(grouped)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
    .map((date) => ({
      title: dayjs(date).format("D MMM YYYY"),
      data: grouped[date],
    }));

  // CARD limpia — Variante B
  const renderItem = ({ item }) => {
    const qty = item.qty ?? item.quantity ?? 1;
    const unit = item.unit ?? "u";
    const unitPrice =
      item.unitPrice != null ? Number(item.unitPrice).toFixed(2) : null;

    const summary = item.priceInfo?.summary;

    return (
      <View style={styles.card}>
        {/* Fila 1: nombre + chevron */}
        <View style={styles.rowTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        {/* Fila 2: fecha + tienda */}
        <View style={styles.rowMid}>
          <View style={styles.rowInline}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>
              {dayjs(item.purchasedAt).format("D MMM YYYY")}
            </Text>
          </View>

          {item.store && (
            <View style={[styles.rowInline, { marginLeft: 8 }]}>
              <Text style={styles.dot}>•</Text>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{String(item.store)}</Text>
            </View>
          )}
        </View>

        {/* Fila 3: código de barras */}
        {item.barcode && (
          <View style={styles.rowBarcode}>
            <BarcodeLink barcode={item.barcode} label="Código:" />
          </View>
        )}

        {/* Fila 4 — VARIANTE B: Info izquierda + Total derecha */}
        <View style={styles.rowVariantB}>
          {/* Bloque izquierdo */}
          <View style={{ flex: 1 }}>
            {/* Cantidad */}
            <View style={styles.rowInline}>
              <Ionicons name="cart-outline" size={16} color="#4B5563" />
              <Text style={styles.detailText}>
                {qty} {unit}
              </Text>
            </View>

            {/* Precio unitario */}
            {unitPrice && (
              <Text style={styles.detailIndented}>
                {unitPrice} €/ {unit}
              </Text>
            )}

            {/* Promoción */}
            {summary && <Text style={styles.offerText}>{summary}</Text>}
          </View>

          {/* Bloque derecho: Total */}
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalText}>
              {(item.price ?? 0).toFixed(2)} €
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Historial de Compras</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar producto, código, tienda..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {sortedSections.length === 0 ? (
        <Text style={styles.empty}>No hay resultados</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          {sortedSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <FlatList
                data={section.data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id + "-" + index}
                scrollEnabled={false}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ----------------- ESTILOS ----------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },

  searchBar: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    fontSize: 16,
  },

  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#888",
  },

  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#444",
  },

  /* CARD nueva */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },

  /* Fila 1 */
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  /* Fila 2 */
  rowMid: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 4,
    color: "#6B7280",
    fontSize: 14,
  },
  dot: {
    marginHorizontal: 6,
    color: "#9CA3AF",
  },

  /* Fila 3 */
  rowBarcode: {
    marginTop: 8,
  },

  /* VARIANTE B */
  rowVariantB: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
  },

  detailText: {
    marginLeft: 6,
    fontSize: 15,
    color: "#4B5563",
  },

  detailIndented: {
    marginLeft: 22,
    fontSize: 15,
    color: "#4B5563",
  },

  offerText: {
    marginLeft: 22,
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },

  totalBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
  },

  totalText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#059669",
  },
});
