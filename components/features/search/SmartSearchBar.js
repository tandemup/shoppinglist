// components/SmartSearchBar.js
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
import { getScannedHistory } from "../../../services/scannerHistory";

export default function SmartSearchBar({ currentList, onSelectHistoryItem }) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [historyResults, setHistoryResults] = useState([]);
  const [scanResults, setScanResults] = useState([]);

  const handleSearch = async (text) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setLocalResults([]);
      setHistoryResults([]);
      setScanResults([]);
      return;
    }

    const q = text.toLowerCase();

    // 1️⃣ Coincidencias en la lista actual
    const local = currentList.items.filter((i) =>
      (i.name || "").toLowerCase().includes(q),
    );

    // 2️⃣ Coincidencias en listas anteriores
    const history = await searchItemsAcrossLists(text);
    const filteredHistory = history.filter(
      (r) => String(r.listId) !== String(currentList.id),
    );

    // 3️⃣ Coincidencias en historial de escaneos
    const scanned = await getScannedHistory();
    const scanMatches = scanned.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.barcode || "").toLowerCase().includes(q),
    );

    setLocalResults(local);
    setHistoryResults(filteredHistory);
    setScanResults(scanMatches);
  };

  const getUnitPriceDiff = (name, pastUnitPrice) => {
    const match = currentList.items.find(
      (i) => i.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

    if (!match || !match.priceInfo?.unitPrice) return null;

    const current = parseFloat(match.priceInfo.unitPrice);
    const diff = current - parseFloat(pastUnitPrice || 0);

    if (diff === 0) return { symbol: "=", color: "#777", value: "0.00" };
    if (diff > 0)
      return { symbol: "↑", color: "#e53935", value: `+${diff.toFixed(2)}` };

    return { symbol: "↓", color: "#43a047", value: diff.toFixed(2) };
  };

  const getUnitLabel = (item) => {
    const u = item?.priceInfo?.unitType || "unidad";
    if (u === "kg") return "€/kg";
    if (u === "l") return "€/l";
    return "€/u";
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar producto (actual, histórico o escaneos)…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {(localResults.length > 0 ||
        historyResults.length > 0 ||
        scanResults.length > 0) && (
        <FlatList
          data={[
            ...(localResults.length > 0
              ? [{ header: "📋 En esta lista" }, ...localResults]
              : []),

            ...(historyResults.length > 0
              ? [{ header: "🕓 En listas anteriores" }, ...historyResults]
              : []),

            ...(scanResults.length > 0
              ? [{ header: "📷 En historial de escaneos" }, ...scanResults]
              : []),
          ]}
          keyExtractor={(item, index) => item.id || `header-${index}`}
          style={styles.resultsBox}
          renderItem={({ item }) => {
            if (item.header) {
              return <Text style={styles.header}>{item.header}</Text>;
            }

            // 🟩 En lista actual
            if (!item.listName && !item.source) {
              const unit = item.priceInfo?.unitPrice ?? null;
              const formatted = unit ? parseFloat(unit).toFixed(2) : "—";

              return (
                <TouchableOpacity
                  style={[styles.resultRow, styles.currentRow]}
                  onPress={() => onSelectHistoryItem(item)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>

                  <Text style={styles.listInfo}>
                    💰 {formatted} {getUnitLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            }

            // 🟧 Escaneos
            if (item.source === "scanner") {
              return (
                <TouchableOpacity
                  style={[styles.resultRow, { backgroundColor: "#FFF7ED" }]}
                  onPress={() => onSelectHistoryItem(item)}
                >
                  <Text style={styles.itemName}>
                    {item.isBook ? "📚 " : ""}
                    {item.name}
                  </Text>

                  <Text style={styles.listInfo}>Código: {item.barcode}</Text>
                </TouchableOpacity>
              );
            }

            // 🟦 Historial de listas
            const historicItem = item.item;
            const pastUnit = historicItem.priceInfo?.unitPrice ?? 0;
            const diff = getUnitPriceDiff(historicItem.name, pastUnit);

            return (
              <TouchableOpacity
                style={[styles.resultRow, styles.historyRow]}
                onPress={() => onSelectHistoryItem(historicItem)}
              >
                <Text style={styles.itemName}>{historicItem.name}</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.listInfo}>
                    💰 {pastUnit.toFixed(2)} {getUnitLabel(historicItem)} · 🧾{" "}
                    {item.listName}
                  </Text>

                  {diff && (
                    <Text
                      style={[
                        styles.diffText,
                        { marginLeft: 6, color: diff.color },
                      ]}
                    >
                      {diff.symbol} {diff.value} {getUnitLabel(historicItem)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 30,
    marginHorizontal: 5,
  },

  searchBox: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 6,
    outlineStyle: "none",
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
