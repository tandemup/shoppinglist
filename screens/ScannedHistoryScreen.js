import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";

import {
  getScannedHistory,
  removeScannedItem,
} from "../utils/storage/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  //
  // 📌 ESTADOS
  //
  const [scannedItems, setScannedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  //
  // 🍔 MENÚ HAMBURGUESA
  //
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //
  // 🔄 CARGAR ELEMENTOS ESCANEADOS REALES
  //
  useEffect(() => {
    loadScannedHistory();
  }, []);

  const loadScannedHistory = async () => {
    try {
      const all = await getScannedHistory();

      const onlyScanned = all.filter((i) => i.source === "scanner");

      // Ordenar por fecha descendente
      onlyScanned.sort(
        (a, b) =>
          new Date(b.scannedAt).valueOf() - new Date(a.scannedAt).valueOf()
      );

      setScannedItems(onlyScanned);
      setFilteredItems(onlyScanned);
    } catch (error) {
      console.log("Error loading scanned history:", error);
    }
  };

  //
  // 🔎 FILTRAR RESULTADOS
  //
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(scannedItems);
      return;
    }

    const q = searchQuery.toLowerCase();

    const results = scannedItems.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.barcode?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q)
      );
    });

    setFilteredItems(results);
  }, [searchQuery, scannedItems]);

  //
  // 🗑 LONG PRESS PARA BORRAR UN ITEM
  //
  const handleDelete = (item) => {
    safeAlert("Eliminar", `¿Deseas eliminar este escaneo?\n\n${item.name}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeScannedItem(item.barcode); // ← ✔ CORREGIDO
          loadScannedHistory(); // Recargar
        },
      },
    ]);
  };

  //
  // 🎨 RENDER DE CADA ITEM
  //
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("EditScannedItem", {
          item,
          reload: loadScannedHistory, // ⭐ PASAMOS LA FUNCIÓN
        })
      }
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.card, item.isBook && styles.cardBook]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.isBook ? "📚 " : ""}
            {item.name}
          </Text>

          {item.barcode && (
            <Text style={styles.barcode}>Código: {item.barcode}</Text>
          )}

          {item.scanCount > 1 && (
            <Text style={styles.count}>Escaneado {item.scanCount} veces</Text>
          )}

          {item.scannedAt && (
            <Text style={styles.date}>
              Escaneado el{" "}
              {new Date(item.scannedAt).toLocaleDateString("es-ES")}
            </Text>
          )}
        </View>

        {/* ⭐ FLECHA DE NAVEGACIÓN */}
        <Ionicons
          name="chevron-forward"
          size={26}
          color="#888"
          style={{ alignSelf: "center", marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );

  //
  // 🖥 RENDER PRINCIPAL
  //
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial de Escaneos</Text>

      {/* 🔎 Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={{ marginRight: 6 }}
        />
        <TextInput
          placeholder="Buscar producto o código..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 📋 Lista filtrada */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.barcode} // ← ✔ CORREGIDO
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron resultados</Text>
        }
      />
    </SafeAreaView>
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#888",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 1,
  },

  // ⭐ Estilo especial para libros
  cardBook: {
    backgroundColor: "#E0F2FF",
    borderColor: "#60A5FA",
    borderWidth: 1.2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  barcode: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  count: {
    marginTop: 2,
    fontSize: 12,
    color: "#444",
    fontStyle: "italic",
  },

  date: {
    marginTop: 4,
    color: "#0066CC",
    fontSize: 12,
  },

  // 🔎 Barra de búsqueda
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
});
