import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ROUTES } from "../navigation/ROUTES";
import stores from "../data/stores.json";

export default function StoresBrowseScreen({ navigation }) {
  const [query, setQuery] = useState("");

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter((s) => {
      const name = s.name?.toLowerCase() ?? "";
      const addr = s.address?.toLowerCase() ?? "";
      return name.includes(q) || addr.includes(q);
    });
  }, [query]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        navigation.navigate(ROUTES.STORE_DETAIL, { storeId: item.id })
      }
    >
      <Text style={styles.name}>{item.name}</Text>
      {item.address ? <Text style={styles.address}>{item.address}</Text> : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Buscar tiendas…"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <Text style={styles.counter}>
          {filteredStores.length} resultado
          {filteredStores.length === 1 ? "" : "s"}
        </Text>
      </View>

      <FlatList
        data={filteredStores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  searchWrap: {
    padding: 16,
    paddingBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  counter: {
    marginTop: 8,
    fontSize: 12,
    color: "#6B7280",
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: "#666",
  },
});
