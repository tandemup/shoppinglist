import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useConfig } from "../context/ConfigContext";
import { useStoresWithDistance } from "../hooks/useStoresWithDistance";
import StoreCard from "../components/StoreCard";
import { ROUTES } from "../navigation/ROUTES";

export default function StoreSelectScreen({ navigation, route }) {
  const { onSelectStore } = route.params ?? {};
  const { favoriteStoreIds } = useConfig();
  const { sortedStores } = useStoresWithDistance();

  const favoriteStores = sortedStores.filter((s) =>
    favoriteStoreIds.includes(s.id)
  );

  if (favoriteStores.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>No tienes tiendas favoritas</Text>
        <Text style={styles.subtitle}>
          Ve al tab "Tiendas" y marca ⭐ las tiendas que usas habitualmente
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate(ROUTES.TIENDAS)}
        >
          <Text style={styles.buttonText}>Ir a Tiendas</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={favoriteStores}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StoreCard
          store={item}
          onPress={async () => {
            if (typeof onSelectStore === "function") {
              await onSelectStore(item);
            }
            navigation.goBack();
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
