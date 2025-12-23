import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { ROUTES } from "../navigation/ROUTES";
import StoreCard from "../components/StoreCard";
import { useConfig } from "../context/ConfigContext";
import stores from "../data/stores.json";

export default function StoresFavoritesScreen() {
  const navigation = useNavigation();
  const { favoriteStores } = useConfig();

  const favoriteList = stores.filter((s) => favoriteStores.includes(s.id));

  const handleOpenStore = (store) => {
    navigation.navigate(ROUTES.STORE_DETAIL, { storeId: store.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      {favoriteList.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No tienes tiendas favoritas</Text>
          <Text style={styles.emptyText}>
            Marca ⭐ una tienda para que aparezca aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoreCard store={item} onPress={() => handleOpenStore(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
