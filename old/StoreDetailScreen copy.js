import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useStores } from "../context/StoresContext";
import { useLists } from "../context/ListsContext";

import {
  formatStoreName,
  formatStoreAddress,
  formatStoreOpeningText,
} from "../utils/store";

export default function StoreDetailScreen({ route }) {
  const navigation = useNavigation();
  const { updateListStore } = useLists();

  const { storeId, listId } = route.params || {};
  const { stores } = useStores();

  const store = useMemo(
    () => stores.find((s) => s.id === storeId),
    [stores, storeId]
  );

  if (!store) {
    return (
      <View style={styles.center}>
        <Text>Tienda no disponible</Text>
      </View>
    );
  }

  const handleSelectStore = () => {
    if (!listId) return;

    updateListStore(listId, store.id);

    // Volvemos al flujo original
    navigation.getParent()?.goBack(); // sale de StoreDetail
    navigation.getParent()?.goBack(); // sale de StoresTab
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{formatStoreName(store)}</Text>
      </View>

      {/* HORARIO RESUMEN */}
      <Text style={styles.openingText}>{formatStoreOpeningText(store)}</Text>

      {/* DIRECCIÓN */}
      <Text style={styles.address}>{formatStoreAddress(store)}</Text>

      {/* HORARIO DETALLADO */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horario</Text>

        {store.hours && Object.keys(store.hours).length > 0 ? (
          Object.entries(store.hours).map(([day, ranges]) => (
            <Text key={day} style={styles.hourRow}>
              <Text style={styles.day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
              </Text>{" "}
              {!Array.isArray(ranges) || ranges.length === 0
                ? "Cerrado"
                : ranges.map((r) => `${r.open} – ${r.close}`).join(", ")}
            </Text>
          ))
        ) : (
          <Text style={styles.hourRow}>Horario no disponible</Text>
        )}
      </View>

      {/* BOTÓN SELECCIONAR */}
      {listId && (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={handleSelectStore}
        >
          <Text style={styles.selectButtonText}>Seleccionar esta tienda</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#FAFAFA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  openingText: {
    marginTop: 4,
    fontSize: 14,
    color: "#555",
  },

  address: {
    marginTop: 6,
    fontSize: 14,
    color: "#333",
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  hourRow: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  day: {
    fontWeight: "600",
  },

  selectButton: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },

  selectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
