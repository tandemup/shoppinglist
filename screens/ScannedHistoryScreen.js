import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import {
  getScannedHistory,
  deleteScannedEntry,
} from "../utils/storage/scannerHistory";

export default function ScannedHistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await getScannedProducts();
      setItems(data);
    };
    const unsubscribe = navigation.addListener("focus", load);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: "black", padding: 16 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("EditScannedItemScreen", { item })
            }
            style={{
              padding: 12,
              backgroundColor: "#222",
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: "#aaa" }}>{item.brand}</Text>
            <Text style={{ color: "#4ea" }}>{item.code}</Text>
          </Pressable>
        )}
      />
    </View>
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
