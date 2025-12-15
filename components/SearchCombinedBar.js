//SearchCombinedBar
import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { searchItemsAcrossLists } from "../utils/searchHelpers";
import { getScannedHistory } from "../utils/storage/scannerHistory";

export default function SearchCombinedBar({
  currentList,
  onSelectHistoryItem,
  onCreateItem,
}) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState([]);
  const [historyResults, setHistoryResults] = useState([]);
  const [scanResults, setScanResults] = useState([]);

  //
  // 🔎 BÚSQUEDA GLOBAL
  //
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
      (i.name || "").toLowerCase().includes(q)
    );

    // 2️⃣ Coincidencias históricas
    const history = await searchItemsAcrossLists(text);
    const filteredHistory = history.filter(
      (r) => String(r.listId) !== String(currentList.id)
    );

    // 3️⃣ Historial de escaneos
    const scanned = await getScannedHistory();
    const scanMatches = scanned.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.barcode || "").toLowerCase().includes(q)
    );

    setLocalResults(local);
    setHistoryResults(filteredHistory);
    setScanResults(scanMatches);
  };

  //
  // 🧮 FORMATOS Y DIFERENCIAS
  //
  const getUnitLabel = (item) => {
    const u = item?.priceInfo?.unitType || "unidad";
    if (u === "kg") return "€/kg";
    if (u === "l") return "€/l";
    return "€/u";
  };

  const getUnitPriceDiff = (name, pastUnitPrice) => {
    const found = currentList.items.find(
      (i) => i.name.trim().toLowerCase() === name.trim().toLowerCase()
    );

    if (!found || !found.priceInfo?.unitPrice) return null;

    const current = parseFloat(found.priceInfo.unitPrice);
    const diff = current - parseFloat(pastUnitPrice || 0);

    if (diff === 0) return { symbol: "=", color: "#777", value: "0.00" };
    if (diff > 0)
      return { symbol: "↑", color: "#e53935", value: `+${diff.toFixed(2)}` };

    return { symbol: "↓", color: "#43a047", value: diff.toFixed(2) };
  };

  //
  // 🔍 Detectar “no results”
  //
  const noResults =
    query.trim().length >= 2 &&
    localResults.length === 0 &&
    historyResults.length === 0 &&
    scanResults.length === 0;

  //
  // RENDER
  //
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Añadir producto…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {(localResults.length > 0 ||
        historyResults.length > 0 ||
        scanResults.length > 0 ||
        noResults) && (
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
            //
            // HEADER
            //
            if (item.header) {
              return <Text style={styles.header}>{item.header}</Text>;
            }

            //
            // 1️⃣ Coincidencia en LISTA ACTUAL
            //
            if (!item.listName && !item.source) {
              return (
                <TouchableOpacity
                  style={[styles.resultRow, styles.currentRow]}
                  onPress={() => onSelectHistoryItem(item)}
                >
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.listInfo}>
                    💰 {item.priceInfo?.unitPrice?.toFixed?.(2) ?? "—"}{" "}
                    {getUnitLabel(item)}
                  </Text>
                </TouchableOpacity>
              );
            }

            //
            // 2️⃣ Resultado en historial de ESCANEOS
            //
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

            //
            // 3️⃣ Resultado HISTÓRICO (listas antiguas)
            //
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
          ListFooterComponent={() =>
            noResults ? (
              <TouchableOpacity
                style={styles.createRow}
                onPress={() => {
                  const name = query.trim();
                  onCreateItem?.(name);

                  // limpiar
                  setQuery("");
                  setLocalResults([]);
                  setHistoryResults([]);
                  setScanResults([]);
                }}
              >
                <Text style={styles.createText}>➕ Crear “{query.trim()}”</Text>
              </TouchableOpacity>
            ) : null
          }
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

  /* 🔍 Barra de búsqueda */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 6,
  },

  icon: {
    marginRight: 6,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0, // evita saltos verticales en Android
  },

  /* 📦 Resultados */
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

  /* ➕ Crear nuevo item */
  createRow: {
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  createText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    textAlign: "center",
  },
});
