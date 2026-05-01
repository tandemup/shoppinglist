// screens/scanner/ScannerTabScreen.js

import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ROUTES } from "../../navigation/ROUTES";

export default function ScannerTabScreen({ navigation }) {
  const goToScanner = () => {
    navigation.navigate(ROUTES.SCANNER_SCREEN, {
      saveToHistory: true,
    });
  };

  const goToScannedHistory = () => {
    navigation.navigate(ROUTES.SCANNED_HISTORY);
  };

  const goToSelectBrowser = () => {
    navigation.navigate(ROUTES.SEARCH_ENGINES);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scanner</Text>

        <Text style={styles.subtitle}>
          Escanea nuevos productos o consulta el historial de códigos
          escaneados.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={goToScanner}
          >
            <View style={styles.iconBox}>
              <Ionicons name="barcode-outline" size={28} color="#111827" />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Escanear nuevo producto</Text>
              <Text style={styles.cardSubtitle}>
                Abrir la cámara para leer un código de barras
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={goToScannedHistory}
          >
            <View style={styles.iconBox}>
              <Ionicons name="time-outline" size={28} color="#111827" />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Historial de Escaneos</Text>
              <Text style={styles.cardSubtitle}>
                Ver productos y códigos escaneados anteriormente
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={goToSelectBrowser}
          >
            <View style={styles.iconBox}>
              <Ionicons name="search-outline" size={28} color="#111827" />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Motor de Búsqueda</Text>
              <Text style={styles.cardSubtitle}>
                Selecciona motores para productos y libros
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 24,
  },

  actions: {
    gap: 14,
  },

  card: {
    minHeight: 86,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});
