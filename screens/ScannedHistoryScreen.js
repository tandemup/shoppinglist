import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ROUTES } from "../navigation/ROUTES";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../components/AppIcon";

import { safeAlert } from "../utils/core/safeAlert";
import BarcodeLink from "../components/BarcodeLink";

import {
  getScannedHistory,
  removeScannedItem,
} from "../services/scannerHistory";

import { useIsFocused } from "@react-navigation/native";

export default function ScannedHistoryScreen({ navigation }) {
  //
  // 📌 ESTADOS
  //
  const [scannedItems, setScannedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const isFocused = useIsFocused();

  //
  // 🔄 CARGAR HISTORIAL
  //
  useEffect(() => {
    if (isFocused) {
      loadScannedHistory();
    }
  }, [isFocused]);

  const loadScannedHistory = async () => {
    try {
      const all = await getScannedHistory();

      const onlyScanned = all.filter((i) => i.source === "scanner");

      onlyScanned.sort(
        (a, b) =>
          new Date(b.scannedAt).valueOf() - new Date(a.scannedAt).valueOf(),
      );

      setScannedItems(onlyScanned);
      setFilteredItems(onlyScanned);
    } catch (error) {
      console.log("Error loading scanned history:", error);
    }
  };

  //
  // 🔎 FILTRADO
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
  // 🗑 BORRAR ITEM
  //
  const handleDelete = (item) => {
    safeAlert("Eliminar", `¿Deseas eliminar este escaneo?\n\n${item.name}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeScannedItem(item.barcode);
          loadScannedHistory();
        },
      },
    ]);
  };

  //
  // 🖼 OBTENER IMAGEN
  //
  const getItemImage = (item) => {
    return item.thumbnailUri || null;
  };

  //
  // 🎨 ITEM
  //
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(ROUTES.EDIT_SCANNED_ITEM, { item })}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.card, item.isBook && styles.cardBook]}>
        {/* 🖼 IMAGEN */}
        <View style={styles.imageWrapper}>
          {getItemImage(item) ? (
            <Image
              source={{ uri: getItemImage(item) }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <AppIcon name="cube-outline" size={26} color="#999" />
            </View>
          )}
        </View>

        {/* 📄 INFO */}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.isBook ? "📚 " : ""}
            {item.name}
          </Text>

          {item.barcode && (
            <View style={{ marginTop: 4 }}>
              <BarcodeLink
                barcode={item.barcode}
                label="Buscar código"
                iconColor="#0F52BA"
              />
            </View>
          )}

          {item.scanCount > 1 && (
            <Text style={styles.count}>Escaneado {item.scanCount} veces</Text>
          )}

          {item.scannedAt && (
            <Text style={styles.date}>
              {new Date(item.scannedAt).toLocaleDateString("es-ES")}
            </Text>
          )}
        </View>

        <AppIcon
          name="chevron-forward"
          size={26}
          color="#888"
          style={{ alignSelf: "center", marginLeft: 6 }}
        />
      </View>
    </TouchableOpacity>
  );

  //
  // 🖥 RENDER
  //
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Historial de Escaneos</Text>

      <View style={styles.searchContainer}>
        <AppIcon
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

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.barcode ?? `scan-${index}`}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron resultados</Text>
        }
      />
    </SafeAreaView>
  );
}

/* =========================
   🎨 ESTILOS
========================= */
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
    alignItems: "stretch", // 👈 CLAVE
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },

  cardBook: {
    backgroundColor: "#E0F2FF",
    borderColor: "#60A5FA",
    borderWidth: 1.2,
  },
  imageWrapper: {
    width: 64,
    height: 64, // 👈 ahora SÍ fijo
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  count: {
    marginTop: 2,
    fontSize: 12,
    color: "#444",
    fontStyle: "italic",
  },

  date: {
    marginTop: 4,
    color: "#444",
    fontSize: 12,
  },

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
