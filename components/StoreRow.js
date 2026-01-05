import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useStores } from "../context/StoresContext";

/* -------------------------------------------------
   Component
-------------------------------------------------- */
export default function StoreRow({ store, onPress, selectable = false }) {
  const { toggleFavoriteStore, isFavoriteStore } = useStores();

  const isFavorite = isFavoriteStore(store.id);

  return (
    <TouchableOpacity
      style={[styles.container, selectable && styles.selectable]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{store.name}</Text>

        {store.city ? <Text style={styles.meta}>{store.city}</Text> : null}

        {store.distanceKm != null && (
          <Text style={styles.distance}>
            {store.distanceKm < 1
              ? `${Math.round(store.distanceKm * 1000)} m`
              : `${store.distanceKm.toFixed(1)} km`}
          </Text>
        )}
      </View>

      {/* Favorite */}
      <TouchableOpacity
        onPress={() => toggleFavoriteStore(store.id)}
        hitSlop={8}
      >
        <Ionicons
          name={isFavorite ? "star" : "star-outline"}
          size={22}
          color={isFavorite ? "#f5b301" : "#ccc"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  selectable: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  info: {
    flex: 1,
    marginRight: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  meta: {
    marginTop: 2,
    fontSize: 13,
    color: "#666",
  },

  distance: {
    marginTop: 4,
    fontSize: 12,
    color: "#2e7d32",
    fontWeight: "500",
  },
});
