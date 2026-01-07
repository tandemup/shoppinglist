import React from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useProductSuggestions } from "../context/ProductSuggestionsContext";
import { useProductLearning } from "../context/ProductLearningContext";

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
  onAddFromScan,
  onCreateNew,
}) {
  const { query, search, suggestions, storeFilter, setStoreFilter, clear } =
    useProductSuggestions();
  const { recordSelection } = useProductLearning();

  /* ---------------------------
     Selection handler
  ----------------------------*/
  const handleSelect = (item) => {
    recordSelection(item.name);

    if (item.type === "create") {
      onCreateNew?.(item.name);
      clear();
      return;
    }

    const normalized = {
      name: item.name,
      priceInfo: item.priceInfo ?? null,
    };

    if (item.type === "history") {
      onAddFromHistory?.(normalized);
    }

    if (item.type === "scan") {
      onAddFromScan?.(normalized);
    }

    clear();
  };

  /* ---------------------------
     Render
  ----------------------------*/
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="🔍 Buscar producto (actual o histórico)…"
        placeholderTextColor="#999"
        value={query}
        onChangeText={search}
        onSubmitEditing={() => {
          if (query.trim()) {
            recordSelection(query.trim());
            onCreateNew?.(query.trim());
            clear();
          }
        }}
        returnKeyType="done"
      />

      <View style={styles.filtersRow}>
        <FilterButton
          label="Todas"
          active={!storeFilter}
          onPress={() => setStoreFilter(null)}
        />
        <FilterButton
          label="Lidl"
          active={storeFilter === "Lidl"}
          onPress={() => setStoreFilter("Lidl")}
        />
        <FilterButton
          label="Carrefour"
          active={storeFilter === "Carrefour"}
          onPress={() => setStoreFilter("Carrefour")}
        />
      </View>

      {suggestions.length > 0 && (
        <FlatList
          style={styles.resultsBox}
          data={suggestions}
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

            const badges = [];
            if (item.type === "history")
              badges.push({ label: "HIST", color: "#2563eb" });
            if (item.frequency >= 5)
              badges.push({ label: `×${item.frequency}`, color: "#7c3aed" });
            if (item.recencyScore >= 5)
              badges.push({ label: "REC", color: "#0ea5e9" });

            return (
              <TouchableOpacity
                style={[
                  styles.resultRow,
                  item.type === "history"
                    ? styles.historyRow
                    : styles.currentRow,
                ]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.badgesRow}>
                  {badges.map((b) => (
                    <Badge
                      key={`${item.id}-${b.label}`}
                      label={b.label}
                      color={b.color}
                    />
                  ))}
                </View>

                <Text style={styles.itemName}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

/* -------------------------------------------------
   Filter button
-------------------------------------------------- */
function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterBtn, active && styles.filterBtnActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  filterBtnActive: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
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
  currentRow: { backgroundColor: "#e8f5e9" },
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
