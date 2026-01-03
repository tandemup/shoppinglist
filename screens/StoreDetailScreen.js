import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import {
  formatStoreName,
  formatStoreAddress,
  formatStoreOpeningText,
  getStoreStatusBadge,
} from "../utils/store";

export default function StoreDetailScreen({ route }) {
  const { store } = route.params;

  if (!store) {
    return (
      <View style={styles.center}>
        <Text>Tienda no disponible</Text>
      </View>
    );
  }

  const badge = getStoreStatusBadge(store);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{formatStoreName(store)}</Text>

        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      {/* HORARIO RESUMEN */}
      <Text style={styles.openingText}>{formatStoreOpeningText(store)}</Text>

      {/* DIRECCIÓN */}
      <Text style={styles.address}>{formatStoreAddress(store)}</Text>

      {/* HORARIO DETALLADO */}
      {store.hours && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario</Text>

          {Object.entries(store.hours).map(([day, ranges]) => (
            <Text key={day} style={styles.hourRow}>
              <Text style={styles.day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
              </Text>{" "}
              {ranges.length === 0
                ? "Cerrado"
                : ranges.map((r) => `${r.open} – ${r.close}`).join(", ")}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

//
// 🎨 ESTILOS
//
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  badgeText: {
    color: "white",
    fontSize: 13,
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
});
