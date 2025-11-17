// screens/ScannedHistoryScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";

export default function ScannedHistoryScreen() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const stored = await AsyncStorage.getItem("scannedProducts");
        const parsed = stored ? JSON.parse(stored) : [];
        setProducts(parsed.reverse());
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };
    loadProducts();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="barcode" size={40} color="#ccc" />
        )}
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.name}>{item.name || "Producto desconocido"}</Text>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
        </View>
      </View>
      <Pressable style={styles.button} onPress={() => Linking.openURL(item.url)}>
        <Text style={styles.buttonText}>Ver producto</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <Text style={{ color: "#ccc", textAlign: "center", marginTop: 40 }}>
          Aún no hay productos guardados.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  header: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    backgroundColor: "#222",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  image: { width: 60, height: 60, borderRadius: 8 },
  name: { color: "white", fontWeight: "bold", fontSize: 16 },
  brand: { color: "#ccc" },
  date: { color: "#999", fontSize: 12, marginTop: 4 },
  button: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
