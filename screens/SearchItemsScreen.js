//screens/SearchItemsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useStore } from "../context/StoreContext";

import { SafeAreaView } from "react-native-safe-area-context";

import { searchItemsAcrossLists } from "../utils/searchHelpers";

export default function SearchItemsScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { reload } = useStore();

  useEffect(() => {
    reload();

    const unsub = navigation.addListener("focus", () => {
      reload();
    });

    return unsub;
  }, [navigation]);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length >= 2) {
      const found = await searchItemsAcrossLists(text);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>🔎 Buscar productos anteriores</Text>

        <TextInput
          style={styles.input}
          placeholder="Escribe un nombre (ej. café, leche...)"
          value={query}
          onChangeText={handleSearch}
        />

        {results.length === 0 && query.length >= 2 && (
          <Text style={styles.empty}>Sin coincidencias</Text>
        )}

        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.listId}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() =>
                navigation.navigate("ItemDetail", {
                  item: item.item,
                  onSave: () => {},
                  onDelete: () => {},
                })
              }
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.item.name}</Text>
                <Text style={styles.listInfo}>
                  🧾 {item.listName} | 💰 {item.item.priceInfo?.total ?? "—"} €
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  listInfo: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
});
