import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { searchItemsAcrossLists } from "../utils/searchHelpers";

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

// 🧾 Etiqueta de unidad
const getUnitLabel = (item) => {
  const u = item?.priceInfo?.unitType || "unidad";
  if (u === "kg") return "€/kg";
  if (u === "l") return "€/l";
  return "€/u";
};

// 🧮 Diferencia de precio unitario
const getUnitPriceDiff = (currentList, name, pastUnitPrice) => {
  const match = currentList.items.find(
    (i) => i.name?.trim().toLowerCase() === name?.trim().toLowerCase()
  );

  if (!match || !match.priceInfo?.unitPrice) return null;

  const current = parseFloat(match.priceInfo.unitPrice);
  const diff = current - parseFloat(pastUnitPrice || 0);

  if (diff === 0) return { symbol: "=", color: "#999", value: "0.00" };
  if (diff > 0)
    return { symbol: "↑", color: "#e53935", value: `+${diff.toFixed(2)}` };

  return { symbol: "↓", color: "#43a047", value: diff.toFixed(2) };
};

/* -------------------------------------------------
   Component
-------------------------------------------------- */
export default function SearchCombinedBar({
  currentList,
  onSelectHistoryItem,
}) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [historyResults, setHistoryResults] = useState([]);

  /* -------------------------------------------------
     Search
  -------------------------------------------------- */
  const handleSearch = async (text) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setLocalResults([]);
      setHistoryResults([]);
      return;
    }

    const q = text.toLowerCase();

    // 1️⃣ Resultados locales
    const local = currentList.items.filter((i) =>
      (i.name || "").toLowerCase().includes(q)
    );

    // 2️⃣ Resultados históricos (otras listas)
    const history = await searchItemsAcrossLists(text);
    const filteredHistory = history.filter(
      (r) => String(r.listId) !== String(currentList.id)
    );

    setLocalResults(local);
    setHistoryResults(filteredHistory);
  };

  /* -------------------------------------------------
     Normalized suggestions
  -------------------------------------------------- */
  const suggestions = [
    ...localResults.map((item) => ({
      id: `local-${item.id}`,
      type: "local",
      name: item.name,
      unitPrice:
        item?.priceInfo?.unitPrice != null
          ? parseFloat(item.priceInfo.unitPrice)
          : null,
      unitLabel: getUnitLabel(item),
      raw: item,
    })),

    ...historyResults.map((entry) => {
      const pastUnit = entry.item.priceInfo?.unitPrice ?? null;

      return {
        id: `history-${entry.item.id}-${entry.listId}`,
        type: "history",
        name: entry.item.name,
        unitPrice: pastUnit != null ? parseFloat(pastUnit) : null,
        unitLabel: getUnitLabel(entry.item),
        listName: entry.listName,
        diff: getUnitPriceDiff(currentList, entry.item.name, pastUnit),
        raw: entry,
      };
    }),
  ];

  /* -------------------------------------------------
     Render item (único)
  -------------------------------------------------- */
  const renderItem = ({ item }) => {
    const isHistory = item.type === "history";

    return (
      <TouchableOpacity
        style={[
          styles.resultRow,
          isHistory ? styles.historyRow : styles.currentRow,
        ]}
        onPress={isHistory ? () => onSelectHistoryItem(item.raw) : undefined}
        activeOpacity={isHistory ? 0.7 : 1}
      >
        <Text style={styles.itemName}>{item.name}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.listInfo}>
            💰 {item.unitPrice != null ? item.unitPrice.toFixed(2) : "—"}{" "}
            {item.unitLabel}
            {isHistory && item.listName ? ` · 🧾 ${item.listName}` : ""}
          </Text>

          {item.diff && (
            <Text
              style={[
                styles.diffText,
                { color: item.diff.color, marginLeft: 6 },
              ]}
            >
              {item.diff.symbol} {item.diff.value} {item.unitLabel}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="🔍 Buscar producto (actual o histórico)..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={handleSearch}
      />

      {suggestions.length > 0 && (
        <FlatList
          style={styles.resultsBox}
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
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
    fontSize: 15,
  },

  resultsBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    maxHeight: 300,
  },

  resultRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  currentRow: {
    backgroundColor: "#E8F5E9",
  },

  historyRow: {
    backgroundColor: "#F9FAFB",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },

  listInfo: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  diffText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
