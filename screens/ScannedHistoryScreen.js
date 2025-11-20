// screens/ScannedHistoryScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  getScannedProducts,
  deleteScannedProduct,
} from "../utils/storageHelpers";

export default function ScannedHistoryScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  // cargar datos
  const load = async () => {
    const data = await getScannedProducts();
    setProducts([...data].reverse()); // más recientes arriba
  };

  useEffect(() => {
    load();
  }, []);

  // Buscar por nombre, marca o código
  const filtered = products.filter((item) => {
    const t = search.toLowerCase();
    return (
      item.code.toLowerCase().includes(t) ||
      item.name.toLowerCase().includes(t) ||
      (item.brand && item.brand.toLowerCase().includes(t))
    );
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name="barcode" size={40} color="#bbb" />
        )}

        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.code}>Código: {item.code}</Text>
          <Text style={styles.name}>{item.name}</Text>
          {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}

          {/* 🔄 BADGE DE CONTADOR */}
          {item.count > 1 && (
            <View style={styles.counterBadge}>
              <MaterialCommunityIcons name="repeat" size={14} color="#fff" />
              <Text style={styles.counterText}>{item.count} veces</Text>
            </View>
          )}

          <Text style={styles.date}>
            {new Date(item.date).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Botón abrir */}
      <Pressable
        style={styles.openBtn}
        onPress={() => Linking.openURL(item.url)}
      >
        <Text style={styles.openBtnText}>🌐 Abrir</Text>
      </Pressable>

      {/* Botón borrar */}
      <Pressable
        style={styles.deleteBtn}
        onPress={async () => {
          await deleteScannedProduct(item.id);
          load();
        }}
      >
        <MaterialCommunityIcons name="delete" size={20} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#111" }}
      edges={Platform.OS === "web" ? [] : ["top"]}
    >
      {/* Buscador */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por código, nombre o marca..."
        placeholderTextColor="#777"
        style={styles.searchInput}
      />

      {filtered.length === 0 ? (
        <Text style={styles.empty}>No hay elementos.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  searchInput: {
    margin: 12,
    padding: 10,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 10,
    fontSize: 15,
  },
  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  deleteBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#c00",
    padding: 6,
    borderRadius: 6,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  code: {
    color: "#22c55e",
    fontWeight: "bold",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  brand: {
    color: "#bbb",
  },

  // 🔄 badge contador
  counterBadge: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  date: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  openBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  openBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
