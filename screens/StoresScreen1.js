import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import stores from "../data/stores.json";
import { useStore } from "../context/StoreContext";

export default function StoresScreen({ navigation }) {
  const { selectedStore, setSelectedStore } = useStore();
  const [search, setSearch] = useState("");

  const filteredStores = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (store) => {
    setSelectedStore(store);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Seleccionar tienda</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder="Buscar tienda..."
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {filteredStores.map((store) => {
          const active = selectedStore?.id === store.id;

          return (
            <TouchableOpacity
              key={store.id}
              style={[styles.card, active && styles.active]}
              onPress={() => handleSelect(store)}
            >
              <View style={styles.row}>
                <Ionicons
                  name={active ? "checkmark-circle" : "radio-button-off"}
                  color={active ? "#007bff" : "#aaa"}
                  size={22}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.name}>{store.name}</Text>
                  <Text style={styles.address}>{store.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f9fc" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderColor: "#ccc",
  },
  input: { flex: 1, marginLeft: 8 },
  card: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 10,
  },
  active: { borderColor: "#007bff" },
  row: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600" },
  address: { fontSize: 13, color: "#666" },
});
