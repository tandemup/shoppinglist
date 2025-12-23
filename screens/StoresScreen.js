import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTES } from "../navigation/ROUTES";

export default function StoresScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Tiendas</Text>
        <Text style={styles.subtitle}>
          Encuentra tiendas, consúltalas en el mapa o selecciónalas para tus
          listas de la compra.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate(ROUTES.STORES_BROWSE)}
        >
          <Text style={styles.primaryText}>Ver tiendas</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.navigate(ROUTES.STORE_MAP)}
        >
          <Text style={styles.secondaryText}>Ver tiendas en el mapa</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  secondaryText: {
    color: "#111",
    fontSize: 16,
    textAlign: "center",
  },
});
