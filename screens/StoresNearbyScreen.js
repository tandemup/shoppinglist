import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useStores } from "../context/StoresContext";
import StoreRow from "../components/StoreRow";

export default function StoresNearbyScreen({ navigation }) {
  const { stores } = useStores();
  const nearbyStores = useMemo(() => {
    return [...stores].sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });
  }, [stores]);

  if (nearbyStores.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>No hay tiendas cercanas</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={nearbyStores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreRow
          store={item}
          onPress={() =>
            navigation?.navigate("StoreDetail", { storeId: item.id })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
});
