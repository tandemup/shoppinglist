import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BarcodeLink from "../components/BarcodeLink";
import { useStore } from "../context/StoreContext";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function PurchaseHistoryScreen({ navigation }) {
  const { purchaseHistory, fetchLists } = useStore();
  const [search, setSearch] = useState("");

  //
  // 🍔 MENÚ HAMBURGUESA (PRESSABLE → evita <a> en Web)
  //
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("Menu")}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="menu" size={26} color="black" />
        </Pressable>
      ),
    });
  }, [navigation]);

  //
  // 🔄 Recargar historial al entrar
  //
  useEffect(() => {
    fetchLists();
  }, []);

  //
  // 🔍 Filtro de búsqueda
  //
  const filtered = purchaseHistory.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.barcode?.toLowerCase().includes(q) ||
      item.store?.toLowerCase().includes(q) ||
      item.listName?.toLowerCase().includes(q)
    );
  });

  //
  // 🗂 Agrupar por fecha
  //
  const grouped = filtered.reduce((acc, item) => {
    const date = dayjs(item.purchasedAt).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedSections = Object.keys(grouped)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
    .map((date) => ({
      title: dayjs(date).format("D MMM YYYY"),
      data: grouped[date].sort(
        (a, b) =>
          dayjs(b.purchasedAt).valueOf() - dayjs(a.purchasedAt).valueOf()
      ),
    }));

  //
  // 🎨 Card del item
  //
  const renderItem1 = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        {item.barcode && <BarcodeLink barcode={item.barcode} label="Código:" />}

        <Text style={styles.price}>
          💶 {item.price} € · Cant: {item.qty ?? 1}
        </Text>

        {item.store ? (
          <Text style={styles.store}>🏪 Tienda: {String(item.store)}</Text>
        ) : null}

        <Text style={styles.fromList}>De la lista: {item.listName}</Text>
      </View>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
    </View>
  );
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* IZQUIERDA: Información del producto */}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>

        {item.barcode && <BarcodeLink barcode={item.barcode} label="Código:" />}

        {item.store && (
          <Text style={styles.store}>🏪 Tienda: {String(item.store)}</Text>
        )}

        <Text style={styles.fromList}>De la lista: {item.listName}</Text>
      </View>

      {/* DERECHA: Precios y cantidad */}
      <View style={styles.priceBlock}>
        <Text style={styles.priceTotal}>
          {Number(item.price || item.priceInfo?.total || 0).toFixed(2)} €
        </Text>

        <Text style={styles.priceUnit}>
          {(item.priceInfo?.unitPrice || item.unitPrice || 0).toFixed(2)} €/u
        </Text>

        <Text style={styles.qty}>Cant: {item.qty ?? item.quantity ?? 1}</Text>
      </View>
    </View>
  );

  //
  // 🖥 Render
  //
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Historial de Compras</Text>

      {/* 🔍 Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar producto, código, tienda..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      {sortedSections.length === 0 ? (
        <Text style={styles.empty}>No hay resultados</Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
          {sortedSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <FlatList
                data={section.data}
                renderItem={renderItem}
                keyExtractor={(item, idx) => item.id + "-" + idx}
                scrollEnabled={false}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

//
// 🎨 Estilos
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    fontSize: 16,
  },
  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#888",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#444",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  barcode: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    color: "#0066CC",
  },
  store: {
    marginTop: 2,
    fontSize: 13,
    color: "#777",
  },
  fromList: {
    marginTop: 4,
    fontSize: 11,
    color: "#A33",
    fontStyle: "italic",
  },
  priceBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 90,
  },

  priceTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A4",
    marginBottom: 4,
  },

  priceUnit: {
    fontSize: 13,
    color: "#555",
  },

  qty: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
});
