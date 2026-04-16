import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ROUTES } from "../../navigation/ROUTES";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

import { safeAlert } from "../../utils/core/safeAlert";
import BarcodeLink from "../../components/controls/BarcodeLink";
import {
  getScannedHistory,
  removeScannedItem,
} from "../../services/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  const [scannedItems, setScannedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const isFocused = useIsFocused();

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
          new Date(b.updatedAt || b.scannedAt).valueOf() -
          new Date(a.updatedAt || a.scannedAt).valueOf(),
      );

      setScannedItems(onlyScanned);
      setFilteredItems(onlyScanned);
    } catch (error) {
      console.log("Error loading scanned history:", error);
    }
  };

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

  const getItemImage = (item) => {
    return item.thumbnailUri || null;
  };

  const openItem = (item) => {
    navigation.navigate(ROUTES.EDIT_SCANNED_ITEM, { item });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.isBook && styles.cardBook]}>
      <TouchableOpacity
        style={styles.mainPressable}
        onPress={() => openItem(item)}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.85}
      >
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
              <Ionicons name="cube-outline" size={26} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.name} numberOfLines={2}>
            {item.isBook ? "📚 " : ""}
            {item.name || "Sin nombre"}
          </Text>

          <Text style={styles.count}>Búsquedas: {item.scanCount ?? 1}</Text>

          {item.scannedAt ? (
            <Text style={styles.date}>
              Fecha: {new Date(item.scannedAt).toLocaleDateString("es-ES")}
            </Text>
          ) : null}
        </View>

        <View style={styles.actionsCol}>
          <Ionicons name="chevron-forward" size={26} color="#888" />
        </View>
      </TouchableOpacity>

      {item.barcode ? (
        <View style={styles.barcodeRow}>
          <BarcodeLink
            barcode={item.barcode}
            label={item.barcode}
            iconColor="#2563eb"
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Historial de Escaneos</Text>

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
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    padding: 14,
  },

  cardBook: {
    backgroundColor: "#E0F2FF",
    borderColor: "#60A5FA",
    borderWidth: 1.2,
  },

  mainPressable: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  imageWrapper: {
    width: 64,
    height: 64,
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

  infoContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  barcodeRow: {
    marginTop: 10,
    marginLeft: 76,
    alignItems: "flex-start",
  },

  count: {
    marginTop: 4,
    fontSize: 12,
    color: "#444",
    fontStyle: "italic",
  },

  date: {
    marginTop: 4,
    color: "#444",
    fontSize: 12,
  },

  actionsCol: {
    justifyContent: "center",
    marginLeft: 6,
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
