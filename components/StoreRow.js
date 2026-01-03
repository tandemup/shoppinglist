import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import {
  formatStoreName,
  formatStoreOpeningText,
  formatStoreDistance,
  getStoreStatusBadge,
} from "../utils/store";

export default function StoreRow({ store, distanceKm, onPress }) {
  if (!store) return null;

  const badge = getStoreStatusBadge(store);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {formatStoreName(store)}
        </Text>

        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      {/* HORARIO */}
      <Text style={styles.openingText}>{formatStoreOpeningText(store)}</Text>

      {/* DISTANCIA */}
      {distanceKm != null && (
        <Text style={styles.distance}>{formatStoreDistance(distanceKm)}</Text>
      )}
    </Pressable>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  openingText: {
    marginTop: 6,
    color: "#555",
    fontSize: 13,
  },

  distance: {
    marginTop: 4,
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "600",
  },
});
