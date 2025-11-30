import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useStore } from "../context/StoreContext";

export default function ScannedHistoryScreen({ navigation }) {
  const [scannedItems, setScannedItems] = useState([]);

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
  // 🔄 CARGAR ELEMENTOS ESCANEADOS
  //
  useEffect(() => {
    loadScannedHistory();
  }, []);

  const loadScannedHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem("SCANNED_HISTORY");
      const data = raw ? JSON.parse(raw) : [];

      // ❗ SOLO ESCANEADOS
      const onlyScanned = data.filter((i) => i.source === "scanner");

      // Ordenar por fecha descendente
      onlyScanned.sort(
        (a, b) =>
          new Date(b.scannedAt).valueOf() - new Date(a.scannedAt).valueOf()
      );

      setScannedItems(onlyScanned);
    } catch (error) {
      console.log("Error loading scanned history:", error);
    }
  };

  //
  // 🎨 RENDER DE CADA ITEM
  //
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.card,
        item.isBook && styles.cardBook, // ⭐ NUEVO
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {item.isBook ? "📚 " : ""}
          {item.name}
        </Text>

        {item.barcode && (
          <Text style={styles.barcode}>Código: {item.barcode}</Text>
        )}

        {item.scannedAt && (
          <Text style={styles.date}>
            Escaneado el {new Date(item.scannedAt).toLocaleDateString("es-ES")}
          </Text>
        )}
      </View>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
    </View>
  );

  //
  // 🖥 RENDER PRINCIPAL
  //
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial de Escaneos</Text>

      <FlatList
        data={scannedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Todavía no has escaneado nada</Text>
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

  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
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

  date: {
    marginTop: 4,
    color: "#0066CC",
    fontSize: 12,
  },
  cardBook: {
    backgroundColor: "#E0F2FF", // Azul muy suave
    borderColor: "#60A5FA",
    borderWidth: 1.2,
  },
});
