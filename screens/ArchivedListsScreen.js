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
        {/* FILA SUPERIOR: título + chevron */}
        <View style={styles.topRow}>
          <Text style={styles.itemname}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
        </View>

        {/* FECHA + TIENDA (ambas con iconos) */}
        <View style={styles.iconRow}>
          {/* Fecha */}
          <Ionicons name="calendar-outline" size={16} color="#777" />
          <Text style={styles.subInfo}>
            {new Date(item.archivedAt || item.createdAt).toLocaleDateString(
              "es-ES",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </Text>

          <Text style={styles.dot}>•</Text>

          {/* Tienda */}
          <Ionicons name="location-outline" size={16} color="#777" />
          <Text style={styles.subInfo}>
            {item.store ? formatStore(item.store) : "Sin tienda"}
          </Text>
        </View>

        {/* SEPARADOR */}
        <View style={styles.separator} />

        {/* FILA INFERIOR: num productos + precio */}
        <View style={styles.bottomRow}>
          {/* Nº productos */}
          <View style={styles.iconRow}>
            <Ionicons name="cart-outline" size={17} color="#777" />
            <Text style={styles.productsText}>{items.length} productos</Text>
          </View>

          {/* Precio */}
          <Text style={styles.price}>{total.toFixed(2)} €</Text>
        </View>
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
    backgroundColor: "#F2F3F7",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  // ---- TOP ROW ----
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  itemname: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },

  // ---- ICON+TEXT ROW ----
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  subInfo: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1,
  },

  // ---- SEPARATOR ----
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 10,
  },

  // ---- BOTTOM ROW ----
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productsText: {
    fontSize: 15,
    color: "#444",
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
  total: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
});

const styles00 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F3F7",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,

    // Sin sombras fuertes: diseño limpio
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },

  // ---- FILA SUPERIOR ----
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },

  // ---- SUBINFO ----
  subInfo: {
    fontSize: 14,
    color: "#7A7A7A",
    marginBottom: 10,
  },

  // ---- SEPARADOR SUTIL ----
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.07)",
    marginVertical: 8,
  },

  // ---- FILA INFERIOR ----
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productsText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },

  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
});

const styles11 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F3F7",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  leftColumn: {
    flex: 1,
    paddingRight: 12,
  },

  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
    minWidth: 80,
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
  },

  bigPrice: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
  total: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  leftColumn: {
    flex: 1,
    paddingRight: 12,
  },

  chevronColumn: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingLeft: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  bottomRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardText: {
    fontSize: 14,
    color: "#555",
  },

  bigPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
  },
});

const styles3 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F3F7",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  leftColumn: {
    flex: 1,
    paddingRight: 10,
  },

  rightColumn: {
    justifyContent: "center",
    alignItems: "flex-end",
    minWidth: 80,
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

  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },

  rightText: {
    fontSize: 14,
    color: "#555",
  },

  cardText: {
    fontSize: 14,
    color: "#555",
  },

  total: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
});

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F2F3F7",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 18,
    color: "#111",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 14,

    // Sombra estilo iOS / Material
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,

    // Linea fina superior para separar visualmente
    borderWidth: 0.3,
    borderColor: "#e5e5e5",
  },

  cardLeft: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },

  cardText: {
    fontSize: 14.5,
    color: "#444",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: "#e2e2e2",
    gap: 6,
  },

  total: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "700",
  },
});

const styles1 = StyleSheet.create({
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
