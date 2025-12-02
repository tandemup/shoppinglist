import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

export default function ArchivedListDetailScreen({ route }) {
  const { listName, store, date, items, total } = route.params;

  //
  // 🔍 RENDER ITEM
  //
  const renderItem = ({ item }) => {
    const qty = item.qty ?? 1;
    const unitPrice = qty > 0 ? (item.price / qty).toFixed(2) : "0.00";

    return (
      <View style={styles.itemCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>

          {item.barcode ? (
            <Text style={styles.itemField}>Código: {item.barcode}</Text>
          ) : null}

          <Text style={styles.itemField}>Cantidad: {qty}</Text>

          <Text style={styles.itemField}>Precio unit.: {unitPrice} €</Text>

          <Text style={styles.itemTotal}>Total: {item.price} €</Text>
        </View>

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : null}
      </View>
    );
  };

  //
  // 🧾 RENDER PRINCIPAL
  //
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Nombre */}
        <Text style={styles.title}>{listName}</Text>

        {/* Datos generales */}
        <View style={styles.headerBox}>
          <Text style={styles.headerText}>🏪 {store}</Text>
          <Text style={styles.headerText}>
            📅 {dayjs(date).format("D MMM YYYY")}
          </Text>
          <Text style={styles.headerTotal}>💶 Total: {total} €</Text>
        </View>

        {/* Items */}
        <FlatList
          scrollEnabled={false}
          data={items}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={renderItem}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  headerBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    marginBottom: 20,
  },
  headerText: { fontSize: 16, marginBottom: 4 },
  headerTotal: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#0A6",
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE3FF",
    marginBottom: 10,
  },

  itemName: { fontSize: 16, fontWeight: "700" },
  itemField: { fontSize: 14, color: "#555", marginTop: 2 },
  itemTotal: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#0A6",
  },

  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginLeft: 10,
  },
});
