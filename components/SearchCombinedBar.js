import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { searchItemsAcrossLists } from "../utils/searchHelpers";

export default function SearchCombinedBar({
  currentList,
  onSelectHistoryItem,
}) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [historyResults, setHistoryResults] = useState([]);

  const handleSearch = async (text) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setLocalResults([]);
      setHistoryResults([]);
      return;
    }

    const q = text.toLowerCase();

    // 🔍 Resultados en la lista actual
    const local = currentList.items.filter((i) =>
      (i.name || "").toLowerCase().includes(q)
    );

    // 🔍 Resultados históricos
    const history = await searchItemsAcrossLists(text);

    // Evitar duplicar coincidencias de la misma lista
    const filteredHistory = history.filter(
      (r) => String(r.listId) !== String(currentList.id)
    );

    setLocalResults(local);
    setHistoryResults(filteredHistory);
  };

  const getUnitPriceDiff = (currentName, pastUnitPrice) => {
    const match = currentList.items.find(
      (i) => i.name.trim().toLowerCase() === currentName.trim().toLowerCase()
    );

    if (!match || !match.priceInfo?.unitPrice) return null;

    const current = parseFloat(match.priceInfo.unitPrice);
    const diff = current - parseFloat(pastUnitPrice || 0);

    if (diff === 0) return { symbol: "=", color: "#999", value: "0.00" };
    if (diff > 0)
      return { symbol: "↑", color: "#e53935", value: `+${diff.toFixed(2)}` };
    return { symbol: "↓", color: "#43a047", value: diff.toFixed(2) };
  };

  const getUnitLabel = (item) => {
    const u = item?.priceInfo?.unitType || "unidad";
    return u === "kg" ? "€/kg" : u === "l" ? "€/l" : "€/u";
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="🔍 Buscar producto (actual o histórico)..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={handleSearch}
      />

      {(localResults.length > 0 || historyResults.length > 0) && (
        <FlatList
          data={[
            ...(localResults.length > 0
              ? [{ header: "📋 En esta lista" }, ...localResults]
              : []),
            ...(historyResults.length > 0
              ? [{ header: "🕓 En listas anteriores" }, ...historyResults]
              : []),
          ]}
          keyExtractor={(item, index) => item.id || `header-${index}`}
          renderItem={({ item }) => {
            // 🏷 Header
            if (item.header) {
              return <Text style={styles.header}>{item.header}</Text>;
            }

            // 🟩 Resultado LOCAL
            if (!item.listName) {
              const unitPrice =
                item?.priceInfo?.unitPrice != null
                  ? parseFloat(item.priceInfo.unitPrice).toFixed(2)
                  : "—";

              return (
                <TouchableOpacity
                  style={[styles.resultRow, styles.currentRow]}
                  onPress={() => onSelectHistoryItem(item)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.listInfo}>
                    💰 {unitPrice} {getUnitLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            }

            // 🟦 Resultado HISTÓRICO
            const pastUnit = item.item.priceInfo?.unitPrice ?? 0;
            const diff = getUnitPriceDiff(item.item.name, pastUnit);

            return (
              <TouchableOpacity
                style={[styles.resultRow, styles.historyRow]}
                onPress={() => onSelectHistoryItem(item.item)}
              >
                <Text style={styles.itemName}>{item.item.name}</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listInfo}>
                    💰 {pastUnit.toFixed(2)} {getUnitLabel(item.item)} · 🧾{" "}
                    {item.listName}
                  </Text>

                  {diff && (
                    <Text
                      style={[
                        styles.diffText,
                        { color: diff.color, marginLeft: 6 },
                      ]}
                    >
                      {diff.symbol} {diff.value} {getUnitLabel(item.item)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          style={styles.resultsBox}
        />
      )}
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 30,
    marginHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 6,
  },
  resultsBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    maxHeight: 300,
  },
  header: {
    fontWeight: "700",
    fontSize: 14,
    color: "#333",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f3f3f3",
  },
  resultRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  currentRow: { backgroundColor: "#E8F5E9" },
  historyRow: { backgroundColor: "#F9FAFB" },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  listInfo: { fontSize: 13, color: "#555", marginTop: 2 },
  diffText: { fontSize: 12, fontWeight: "700" },
});
