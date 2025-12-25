import React, { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useConfig } from "../context/ConfigContext";
import { useStoresWithDistance } from "../hooks/useStoresWithDistance";
import StoreCard from "../components/StoreCard";
import { ROUTES } from "../navigation/ROUTES";

export default function StoreSelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { listId } = route.params ?? {};
  const [search, setSearch] = useState("");
  const { favoriteStores = [] } = useConfig() ?? {};

  const { sortedStores } = useStoresWithDistance();

  // ────────────────────────────────────────────────
  // ⭐ SOLO TIENDAS FAVORITAS
  // ────────────────────────────────────────────────
  const favoriteStoresList = useMemo(() => {
    const ids = Array.isArray(favoriteStores) ? favoriteStores : [];
    return (sortedStores ?? []).filter((s) => ids.includes(s.id));
  }, [sortedStores, favoriteStores]);

  // ────────────────────────────────────────────────
  // 🔍 FILTRO SEGURO
  // ────────────────────────────────────────────────
  const filteredStores = useMemo(() => {
    const text = search?.toLowerCase() ?? "";

    return favoriteStores.filter((store) => {
      return (
        store?.name?.toLowerCase().includes(text) ||
        store?.city?.toLowerCase().includes(text) ||
        store?.postcode?.toString().includes(text)
      );
    });
  }, [favoriteStores, search]);

  // ────────────────────────────────────────────────
  // 🧱 EMPTY STATE
  // ────────────────────────────────────────────────
  if (favoriteStoresList.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>No tienes tiendas favoritas</Text>
        <Text style={styles.subtitle}>
          Ve al tab "Tiendas" y marca ⭐ las tiendas que usas habitualmente
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate(ROUTES.STORES_TAB)}
        >
          <Text style={styles.buttonText}>Ir a Tiendas</Text>
        </Pressable>
      </View>
    );
  }

  // ────────────────────────────────────────────────
  // 🧱 LISTADO
  // ────────────────────────────────────────────────
  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={filteredStores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          store={item}
          onPress={() => {
            navigation.navigate(ROUTES.SHOPPING_LIST, {
              listId,
              selectedStore: item,
            });
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
