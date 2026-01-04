import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useStores } from "../context/StoresContext";

/* -------------------------------------------------
   Row
-------------------------------------------------- */
export default function StoreRow({ store, onPress }) {
  const { isFavorite, toggleFavoriteStore } = useStores();

  const favorite = isFavorite(store.id);

  const handleToggleFavorite = (e) => {
    e?.stopPropagation?.();
    toggleFavoriteStore(store.id);
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{store.name}</Text>

        <Text style={styles.meta}>
          {store.city || ""}
          {store.distanceKm != null && (
            <Text style={styles.distance}>
              {" · "}
              {store.distanceKm < 1
                ? `${Math.round(store.distanceKm * 1000)} m`
                : `${store.distanceKm.toFixed(1)} km`}
            </Text>
          )}
        </Text>
      </View>

      {/* Favorito */}
      <Pressable
        onPress={handleToggleFavorite}
        hitSlop={10}
        style={styles.star}
      >
        <Ionicons
          name={favorite ? "star" : "star-outline"}
          size={22}
          color={favorite ? "#f5b301" : "#bbb"}
        />
      </Pressable>
    </Pressable>
  );
}

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  meta: {
    marginTop: 2,
    fontSize: 13,
    color: "#666",
  },

  distance: {
    fontWeight: "600",
    color: "#2e7d32",
  },

  star: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
});
