import React, { useEffect, useRef } from "react";

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ROUTES } from "../../navigation/ROUTES";

// ✅ IMPORT CLAVE (antes faltaba)
import { safeAlert } from "../../components/ui/alert/safeAlert";

// ✅ STORAGE ACTIONS
import {
  clearLists as clearActiveLists,
  clearPurchaseHistory,
  clearScannedHistory,
  clearStoresData,
  clearAppStorage as clearStorage,
} from "../../src/storage";

/* -------------------------------------------------------------------------- */
/* CARD */
/* -------------------------------------------------------------------------- */

function Card({ title, subtitle, icon, onPress, danger = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, danger && styles.cardDanger]}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.iconWrapper, danger && styles.iconDanger]}>
          <Ionicons
            name={icon}
            size={22}
            color={danger ? "#b91c1c" : "#1f2937"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, danger && styles.textDanger]}>
            {title}
          </Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={danger ? "#b91c1c" : "#9ca3af"}
      />
    </Pressable>
  );
}

export default function MenuScreen() {
  const navigation = useNavigation();

  const goToBarcodeSettings = () => {
    navigation.navigate(ROUTES.BARCODE_SETTINGS);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* HEADER */}
          <Text style={styles.title}>Menú</Text>
          <Text style={styles.subtitle}>
            Gestiona la configuración, el mantenimiento de datos locales y el
            almacenamiento de la aplicación.
          </Text>

          {/* ---------------- SEARCH ---------------- */}
          <View style={styles.section}>
            <Card
              title="Search Engine productos"
              subtitle="Configura los motores usados para buscar productos"
              icon="search-outline"
              onPress={() =>
                navigation.navigate("SearchEngineSettingsScreen", {
                  type: "product",
                })
              }
            />

            <Card
              title="Search Engine libros"
              subtitle="Configura los motores usados para buscar libros"
              icon="book-outline"
              onPress={() =>
                navigation.navigate("SearchEngineSettingsScreen", {
                  type: "book",
                })
              }
            />
            <Card
              title="Configuración del escáner"
              subtitle="Selecciona formatos como EAN-13, EAN-8, UPC o QR"
              icon="barcode-outline"
              onPress={goToBarcodeSettings}
            />

            <Card
              title="Ajustes generales"
              subtitle="Preferencias globales de la aplicación"
              icon="settings-outline"
              onPress={() =>
                safeAlert(
                  "Pendiente",
                  "No hay función implementada todavía para listas archivadas.",
                )
              }
            />
          </View>

          {/* ---------------- DANGER ZONE ---------------- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <Card
              title="Borrar listas activas"
              subtitle="Elimina las listas de compra que todavía no están archivadas"
              icon="trash-outline"
              danger
              onPress={() =>
                safeAlert("Borrar listas activas", "¿Seguro?", [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar",
                    style: "destructive",
                    onPress: async () => {
                      await clearActiveLists();
                    },
                  },
                ])
              }
            />

            <Card
              title="Borrar listas archivadas"
              subtitle="Elimina las listas guardadas como archivadas"
              icon="archive-outline"
              danger
              onPress={() =>
                safeAlert(
                  "Pendiente",
                  "No hay función implementada todavía para listas archivadas.",
                )
              }
            />

            <Card
              title="Borrar historial de compras"
              subtitle="Limpia los registros generados a partir de listas archivadas"
              icon="receipt-outline"
              danger
              onPress={() =>
                safeAlert("Borrar historial de compras", "¿Seguro?", [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar",
                    style: "destructive",
                    onPress: async () => {
                      await clearPurchaseHistory();
                    },
                  },
                ])
              }
            />

            <Card
              title="Borrar historial de escaneos"
              subtitle="Elimina productos y códigos guardados desde el scanner"
              icon="barcode-outline"
              danger
              onPress={() =>
                safeAlert("Borrar historial de escaneos", "¿Seguro?", [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar",
                    style: "destructive",
                    onPress: async () => {
                      await clearScannedHistory();
                    },
                  },
                ])
              }
            />

            <Card
              title="Recargar tiendas"
              subtitle="Restaura las tiendas desde los datos iniciales"
              icon="refresh-outline"
              danger
              onPress={() =>
                safeAlert(
                  "Recargar tiendas",
                  "Se perderán cambios locales. ¿Continuar?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Recargar",
                      style: "destructive",
                      onPress: async () => {
                        await clearStoresData();
                        navigation.navigate(ROUTES.SHOPPING_TAB);
                      },
                    },
                  ],
                )
              }
            />

            <Card
              title="Borrar almacenamiento completo"
              subtitle="Elimina todos los datos locales"
              icon="close-circle-outline"
              danger
              onPress={() =>
                safeAlert(
                  "Borrar almacenamiento",
                  "Esta acción no se puede deshacer",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar todo",
                      style: "destructive",
                      onPress: async () => {
                        await clearStorage();
                        navigation.navigate(ROUTES.SHOPPING_TAB);
                      },
                    },
                  ],
                )
              }
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES */
/* -------------------------------------------------------------------------- */

const styles = {
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 20,
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardDanger: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconDanger: {
    backgroundColor: "#fee2e2",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  textDanger: {
    color: "#b91c1c",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  warningPanel: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#FACC15",
    marginVertical: 12,
  },

  warningStripeWrapper: {
    flex: 1,
    position: "relative",
  },

  warningStripe: {
    position: "absolute",
    top: -20,
    width: 14,
    height: 80,
    transform: [{ rotate: "35deg" }],
  },
};
