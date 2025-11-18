// screens/ScannedHistoryScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getScannedProducts,
  deleteScannedProduct,
} from "../utils/storageHelpers";
import { Linking } from "react-native";

export default function ScannedHistoryScreen() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    const data = await getScannedProducts();
    setProducts(data.reverse());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="barcode" size={40} color="#bbb" />
        )}

        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.name}>{item.name || "Producto desconocido"}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => Linking.openURL(item.url)}
      >
        <Text style={styles.buttonText}>Ver producto</Text>
      </Pressable>

      <Pressable
        style={styles.deleteButton}
        onPress={async () => {
          await deleteScannedProduct(item.id);
          loadProducts();
        }}
      >
        <MaterialCommunityIcons name="delete" size={22} color="white" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <Text style={styles.empty}>Aún no hay productos guardados.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  empty: { color: "#777", textAlign: "center", marginTop: 40 },

  card: {
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
  },

  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#c00",
    padding: 6,
    borderRadius: 6,
  },

  image: { width: 60, height: 60, borderRadius: 8 },
  name: { color: "white", fontWeight: "bold", fontSize: 16 },
  brand: { color: "#aaa" },
  date: { color: "#777", marginTop: 4 },

  button: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
