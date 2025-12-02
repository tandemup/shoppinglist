import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useStore } from "../context/StoreContext";

dayjs.locale("es");

export default function ArchivedListsScreen({ navigation }) {
  const { purchaseHistory } = useStore();

  // 🔍 Estado del buscador
  const [search, setSearch] = useState("");

  //
  // 🧠 AGRUPAR ITEMS POR LISTA (listName + fecha archivada)
  //
  const groupedLists = useMemo(() => {
    const groups = {};

    for (const item of purchaseHistory) {
      const date = dayjs(item.purchasedAt).format("YYYY-MM-DD");
      const key = `${item.listName}__${date}`;

      if (!groups[key]) {
        groups[key] = {
          listName: item.listName,
          store: item.store || "—",
          date,
          items: [],
        };
      }
      groups[key].items.push(item);
    }

    // Convertir en array
    let listArray = Object.values(groups);

    //
    // 🔍 FILTRAR POR BUSQUEDA
    //
    if (search.trim().length > 0) {
      const q = search.toLowerCase();

      listArray = listArray.filter((l) => {
        const matchesListName = l.listName.toLowerCase().includes(q);
        const matchesStore = l.store?.toLowerCase().includes(q);
        const matchesDate = dayjs(l.date)
          .format("D MMM YYYY")
          .toLowerCase()
          .includes(q);

        const matchesItems = l.items.some((it) =>
          it.name?.toLowerCase().includes(q)
        );

        return matchesListName || matchesStore || matchesDate || matchesItems;
      });
    }

    //
    // 📅 ORDENAR: más recientes primero
    //
    listArray.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

    return listArray;
  }, [purchaseHistory, search]);

  //
  // 📦 CARD DE UNA LISTA ARCHIVADA
  //
  const renderCard = ({ item }) => {
    const total = item.items
      .reduce((acc, x) => acc + (parseFloat(x.price) || 0), 0)
      .toFixed(2);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ArchivedListDetail", {
            listName: item.listName,
            store: item.store,
            date: item.date,
            items: item.items,
            total,
          })
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.listName}>{item.listName}</Text>

          <Text style={styles.info}>🏪 {item.store}</Text>

          <Text style={styles.info}>
            📅 {dayjs(item.date).format("D MMM YYYY")}
          </Text>

          <Text style={styles.info}>📦 {item.items.length} productos</Text>

          <Text style={styles.total}>💶 Total: {total} €</Text>
        </View>

        {/* ➤ CHEVRON */}
        <Ionicons name="chevron-forward" size={28} color="#555" />
      </TouchableOpacity>
    );
  };

  //
  // 🖥 RENDER
  //
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>Listas Archivadas</Text>

      {/* 🔍 Barra de búsqueda */}
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por lista, tienda, fecha o producto..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={groupedLists}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay resultados</Text>}
      />
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
    backgroundColor: "#F3F4F6",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 15,
  },

  // 🔍 Buscador
  searchBar: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    fontSize: 16,
  },

  empty: {
    marginTop: 40,
    fontSize: 16,
    textAlign: "center",
    color: "#999",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE3FF",
    marginBottom: 12,
    alignItems: "center",
  },

  listName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },

  info: { fontSize: 14, color: "#555" },

  total: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#0A6",
  },
});
