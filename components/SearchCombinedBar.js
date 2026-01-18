import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useStores } from "../context/StoresContext";
import { useLists } from "../context/ListsContext";
import { normalizeProductName } from "../utils/normalizeProductName";
import { DEFAULT_CURRENCY } from "../constants/currency";

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

/* -------------------------------------------------
   Badge
-------------------------------------------------- */
const Badge = ({ label, color }) => (
  <View
    style={[
      styles.badge,
      { backgroundColor: color + "20", borderColor: color },
    ]}
  >
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

/* -------------------------------------------------
   Component
-------------------------------------------------- */
export default function SearchCombinedBar({
  currentList,
  onAddFromHistory,
  onCreateNew,
}) {
  const { purchaseHistory } = useLists();
  const { getStoreById } = useStores();
  const [query, setQuery] = useState("");

  /* -------------------------------------------------
     Suggestions
  -------------------------------------------------- */
  const suggestions = useMemo(() => {
    const q = normalizeProductName(query);
    if (!q) return [];

    return purchaseHistory
      .filter((e) => {
        // filtro por texto
        if (!e.normalizedName.includes(q)) return false;

        // filtro por tienda (solo si la lista tiene tienda)
        if (currentList?.storeId) {
          return e.storeId === currentList.storeId;
        }

        // si no hay tienda seleccionada, aceptar todo
        return true;
      })
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return b.lastPurchasedAt - a.lastPurchasedAt;
      })
      .slice(0, 8)
      .map((e) => ({
        id: e.id,
        type: "history",
        name: e.name,
        priceInfo: e.priceInfo ?? null,
        storeId: e.storeId ?? null,
      }));
  }, [query, purchaseHistory, currentList?.storeId]);

  const showCreate =
    query.trim().length > 0 &&
    !suggestions.some(
      (s) =>
        normalizeProductName(s.name) === normalizeProductName(query.trim()),
    );

  /* -------------------------------------------------
     Selection handler
  -------------------------------------------------- */
  const handleSelect = (item) => {
    if (item.type === "create") {
      onCreateNew?.(item.name);
      setQuery("");
      return;
    }

    if (item.type === "history") {
      onAddFromHistory?.({
        name: item.name,
        priceInfo: item.priceInfo
          ? {
              ...item.priceInfo,
              currency: DEFAULT_CURRENCY,
            }
          : null,
      });
      setQuery("");
    }
  };

  /* -------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="🔍 Buscar producto (actual o histórico)…"
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => {
          if (query.trim()) {
            onCreateNew?.(query.trim());
            setQuery("");
          }
        }}
        returnKeyType="done"
      />

      {(suggestions.length > 0 || showCreate) && (
        <FlatList
          style={styles.resultsBox}
          data={[
            ...suggestions,
            ...(showCreate
              ? [{ id: "create", type: "create", name: query.trim() }]
              : []),
          ]}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            if (item.type === "create") {
              return (
                <TouchableOpacity
                  style={[styles.resultRow, styles.createRow]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.createText}>➕ Crear "{item.name}"</Text>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                style={[styles.resultRow, styles.historyRow]}
                onPress={() => handleSelect(item)}
              >
                {/* Badge */}
                <View style={styles.badgesRow}>
                  <Badge label="HIST" color="#2563eb" />
                </View>

                {/* Nombre */}
                <Text style={styles.itemName}>{item.name}</Text>

                {/* Meta: precio + tienda */}
                <View style={styles.metaRow}>
                  {item.priceInfo?.total != null && (
                    <Text style={styles.metaText}>
                      💰 {item.priceInfo.total.toFixed(2)} €
                    </Text>
                  )}

                  {item.storeId && (
                    <Text style={styles.metaText}>
                      🏬 {getStoreById(item.storeId)?.name ?? "Tienda"}
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

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 30,
    marginHorizontal: 16,
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
  historyRow: { backgroundColor: "#f9fafb" },
  createRow: { backgroundColor: "#ecfeff" },
  createText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0ea5e9",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  metaRow: {
    marginTop: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#555",
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
