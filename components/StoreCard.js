import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";

export default function StoreCard({ store, onPress }) {
  return (
    <Pressable style={styles.card} onPress={() => onPress?.(store)}>
      <Text style={styles.name}>{store.name}</Text>

      <Text style={styles.meta}>
        {store.type}
        {store.address?.full ? ` · ${store.address.full}` : ""}
      </Text>

      {store.distance != null && (
        <Text style={styles.coords}>
          {(store.distance / 1000).toFixed(2)} km
        </Text>
      )}

      {store.website && (
        <Pressable onPress={() => Linking.openURL(store.website)}>
          <Text style={styles.link}>{store.website}</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  meta: {
    fontSize: 13,
    color: "#666",
  },

  coords: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  link: {
    fontSize: 12,
    color: "#2e7dff",
    marginTop: 4,
  },
});
