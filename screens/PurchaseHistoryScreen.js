import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../context/StoreContext";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export default function PurchaseHistoryScreen() {
  const { purchaseHistory, fetchLists } = useStore();

  //
  // 🔄 Recargar historial cuando se llega a esta pantalla
  //
  useEffect(() => {
    fetchLists(); // opcional — refresca contexto al entrar
  }, []);

  //
  // 🎯 Agrupar por fecha (YYYY-MM-DD)
  //
  const grouped = purchaseHistory.reduce((acc, item) => {
    const date = dayjs(item.purchasedAt).format("YYYY-MM-DD");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  //
  // 🗂 Crear array ordenado por fecha descendente
  //
  const sortedSections = Object.keys(grouped)
    .sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf())
    .map((date) => ({
      title: dayjs(date).format("D MMM YYYY"),
      data: grouped[date].sort(
        (a, b) =>
          dayjs(b.purchasedAt).valueOf() - dayjs(a.purchasedAt).valueOf()
      ),
    }));

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}

        {/* Origen de la lista */}
        {item.listName ? (
          <Text style={styles.fromList}>De: {item.listName}</Text>
        ) : null}

        {item.price ? <Text style={styles.price}>{item.price} €</Text> : null}
      </View>

      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial de Compras</Text>

      {sortedSections.length === 0 ? (
        <Text style={styles.empty}>Todavía no tienes compras archivadas</Text>
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
// 🎨 ESTILOS
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
    marginBottom: 20,
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
  brand: {
    fontSize: 12,
    color: "#777",
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    color: "#0066CC",
  },
  fromList: {
    marginTop: 4,
    fontSize: 11,
    color: "#A33",
    fontStyle: "italic",
  },
});
