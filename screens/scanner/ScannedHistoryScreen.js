import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";

import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";

import { ROUTES } from "../../navigation/ROUTES";
import { safeAlert } from "../../components/ui/alert/safeAlert";
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

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      setFilteredItems(scannedItems);
      return;
    }

    const results = scannedItems.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const barcode = String(item.barcode || "").toLowerCase();
      const brand = String(item.brand || "").toLowerCase();

      return name.includes(q) || barcode.includes(q) || brand.includes(q);
    });

    setFilteredItems(results);
  }, [searchQuery, scannedItems]);

  const loadScannedHistory = async () => {
    try {
      const all = await getScannedHistory();

      const onlyScanned = all.filter((item) => item.source === "scanner");

      onlyScanned.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.scannedAt || 0).valueOf();
        const dateB = new Date(b.updatedAt || b.scannedAt || 0).valueOf();

        return dateB - dateA;
      });

      setScannedItems(onlyScanned);
      setFilteredItems(onlyScanned);
    } catch (error) {
      console.log("Error loading scanned history:", error);
      safeAlert("Error", "No se pudo cargar el historial de escaneos");
    }
  };

  const handleDelete = (item) => {
    safeAlert(
      "Eliminar escaneo",
      `¿Deseas eliminar este escaneo?\n\n${item.name || item.barcode}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeScannedItem(item.barcode);
              await loadScannedHistory();
            } catch (error) {
              console.log("Error deleting scanned item:", error);
              safeAlert("Error", "No se pudo eliminar el escaneo");
            }
          },
        },
      ],
    );
  };

  const getItemImage = (item) => {
    return item.thumbnailUri || item.imageUrl || null;
  };

  const openItem = (item) => {
    navigation.navigate(ROUTES.EDIT_SCANNED_ITEM, { item });
  };

  const renderItem = ({ item }) => {
    const imageUri = getItemImage(item);

    return (
      <View style={[styles.card, item.isBook && styles.cardBook]}>
        <Pressable
          style={styles.mainPressable}
          onPress={() => openItem(item)}
          onLongPress={() => handleDelete(item)}
        >
          <View style={styles.imageWrapper}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
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

            {item.brand ? (
              <Text style={styles.brand} numberOfLines={1}>
                {item.brand}
              </Text>
            ) : null}

            <Text style={styles.count}>Escaneos: {item.scanCount ?? 1}</Text>

            {item.scannedAt ? (
              <Text style={styles.date}>
                Fecha: {new Date(item.scannedAt).toLocaleDateString("es-ES")}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsCol}>
            <Ionicons name="chevron-forward" size={26} color="#888" />
          </View>
        </Pressable>

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
  };

  const emptyMessage = scannedItems.length
    ? "No se encontraron resultados"
    : "No hay escaneos guardados";

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Historial de Escaneos</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />

          <TextInput
            placeholder="Buscar producto o código..."
            placeholderTextColor="#888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.id?.toString() || item.barcode?.toString() || `scan-${index}`
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>{emptyMessage}</Text>}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },

  listContent: {
    paddingBottom: 50,
  },

  headerBlock: {
    marginBottom: 14,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },

  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#888",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
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
    fontWeight: "700",
    color: "#111827",
  },

  brand: {
    marginTop: 3,
    fontSize: 13,
    color: "#4b5563",
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },

  searchIcon: {
    marginRight: 6,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
});
