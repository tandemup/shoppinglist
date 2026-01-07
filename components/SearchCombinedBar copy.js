import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { formatCurrency } from "../utils/store/formatters";
import { formatUnit } from "../utils/pricing/unitFormat";

/* -------------------------------------------------
   SearchCombinedBar
-------------------------------------------------- */
export default function SearchCombinedBar({
  currentList,
  onCreateNew,
  onAddFromHistory,
  onAddFromScan,
}) {
  const [query, setQuery] = useState("");

  /* -------------------------------------------------
     Helpers
  -------------------------------------------------- */
  const normalize = (s = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const matches = (name) => normalize(name).includes(normalize(query));

  const isInCurrentList = (name) =>
    currentList?.items?.some((i) => normalize(i.name) === normalize(name));

  /* -------------------------------------------------
     Sources (placeholder / props futuras)
     En el futuro: historial, escaneos, favoritos…
  -------------------------------------------------- */
  const historyItems = currentList?.history || [];
  const scanItems = currentList?.scanHistory || [];

  /* -------------------------------------------------
     Filtered results
  -------------------------------------------------- */
  const filteredHistory = useMemo(() => {
    if (!query) return [];
    return historyItems.filter(
      (i) => matches(i.name) && !isInCurrentList(i.name)
    );
  }, [query, historyItems, currentList]);

  const filteredScans = useMemo(() => {
    if (!query) return [];
    return scanItems.filter((i) => matches(i.name) && !isInCurrentList(i.name));
  }, [query, scanItems, currentList]);

  const canCreateNew = query.trim().length > 1 && !isInCurrentList(query);

  /* -------------------------------------------------
     Render helpers
  -------------------------------------------------- */
  const renderItem = ({ item }, onPress) => {
    const priceInfo = item.priceInfo || {};

    return (
      <Pressable style={styles.resultRow} onPress={() => onPress(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>

          {priceInfo.unitPrice != null && (
            <Text style={styles.itemMeta}>
              {formatCurrency(priceInfo.unitPrice)} /{" "}
              {formatUnit(priceInfo.unit)}
            </Text>
          )}
        </View>

        <Ionicons name="add-circle-outline" size={22} color="#2e7d32" />
      </Pressable>
    );
  };

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Añadir producto…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* -------- Crear nuevo -------- */}
      {canCreateNew && (
        <Pressable
          style={styles.createRow}
          onPress={() => {
            onCreateNew?.(query.trim());
            setQuery("");
          }}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createText}>Crear “{query.trim()}”</Text>
        </Pressable>
      )}

      {/* -------- Historial -------- */}
      {filteredHistory.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Historial</Text>
          <FlatList
            data={filteredHistory}
            keyExtractor={(i) => i.id}
            renderItem={(props) => renderItem(props, onAddFromHistory)}
          />
        </>
      )}

      {/* -------- Escaneos -------- */}
      {filteredScans.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Escaneados</Text>
          <FlatList
            data={filteredScans}
            keyExtractor={(i) => i.id}
            renderItem={(props) => renderItem(props, onAddFromScan)}
          />
        </>
      )}
    </View>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 17,
    paddingVertical: 6,
    lineHeight: 22,
    textAlignVertical: "center",
  },
  createRow: {
    marginTop: 8,
    backgroundColor: "#2e7d32",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  createText: {
    color: "#fff",
    fontWeight: "600",
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },

  itemMeta: {
    fontSize: 12,
    color: "#666",
  },
});
