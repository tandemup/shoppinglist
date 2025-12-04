import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatStore } from "../utils/formatStore";
import BarcodeLink from "../components/BarcodeLink";

export default function ArchivedListDetailScreen({ route }) {
  const { list } = route.params;

  const items = list.items || [];

  // Total de la lista archivada
  const total = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
    0
  );

  // Render para cada producto
  const renderItem = ({ item }) => {
    const qty = item.quantity ?? item.qty ?? 1;
    const unitPrice = item.price ?? 0;
    const subtotal = qty * unitPrice;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>{item.name}</Text>

          {/* Cantidad + precio */}
          <Text style={styles.itemSubtext}>
            Cantidad: {qty} × {unitPrice.toFixed(2)} €
          </Text>

          {/* Código de barras con enlace */}
          {item.barcode ? (
            <View style={{ marginTop: 4 }}>
              <BarcodeLink barcode={item.barcode} label="barcode" />
            </View>
          ) : null}
        </View>

        <Text style={styles.itemPrice}>{subtotal.toFixed(2)} €</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* TÍTULO */}
      <Text style={styles.title}>{list.name}</Text>

      {/* FECHA */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={18} color="#555" />
        <Text style={styles.rowText}>
          {new Date(list.archivedAt || list.createdAt).toLocaleDateString(
            "es-ES",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
            }
          )}
        </Text>
      </View>

      {/* TIENDA */}
      {list.store ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.rowText}>{formatStore(list.store)}</Text>
        </View>
      ) : null}

      {/* TOTAL */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
      </View>

      {/* ITEMS */}
      <Text style={styles.sectionTitle}>Productos</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: "#e5e5e5" }} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },

  rowText: {
    fontSize: 15,
    color: "#444",
    flexShrink: 1,
  },

  totalBox: {
    marginTop: 18,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 10,
  },

  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },

  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  itemSubtext: {
    fontSize: 13,
    color: "#666",
  },

  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  barcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6,
  },

  barcodeText: {
    fontSize: 12,
    color: "#444",
  },
});
