// screens/menu/MenuScreen.js

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

import { ROUTES } from "../../navigation/ROUTES";

import { safeAlert } from "../../components/ui/alert/safeAlert";

import {
  clearAppStorage as clearStorage,
  clearLists as clearActiveLists,
  clearPurchaseHistory,
  clearScannedHistory,
  clearStoresData,
} from "../../src/storage";

export default function MenuScreen({ navigation }) {
  const DangerRow = ({ icon, label, onPress }) => {
    return (
      <TouchableOpacity style={styles.dangerRow} onPress={onPress}>
        <Ionicons
          name={icon}
          size={20}
          color="#b91c1c"
          style={styles.rowIcon}
        />

        <Text style={styles.dangerText}>{label}</Text>

        <Ionicons name="warning" size={20} color="#b91c1c" />
      </TouchableOpacity>
    );
  };

  const handleClearArchivedLists = () => {
    safeAlert(
      "Pendiente",
      "No hay una función clearArchivedLists exportada en el storage actual.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mantenimiento</Text>

          <DangerRow
            icon="trash-outline"
            label="Borrar listas activas"
            onPress={() =>
              safeAlert("Borrar listas activas", "¿Seguro?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Borrar",
                  style: "destructive",
                  onPress: clearActiveLists,
                },
              ])
            }
          />

          <DangerRow
            icon="file-tray-outline"
            label="Borrar listas archivadas"
            onPress={() =>
              safeAlert("Borrar listas archivadas", "¿Seguro?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Borrar",
                  style: "destructive",
                  onPress: handleClearArchivedLists,
                },
              ])
            }
          />

          <DangerRow
            icon="receipt-outline"
            label="Borrar historial de compras"
            onPress={() =>
              safeAlert("Borrar historial de compras", "¿Seguro?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Borrar",
                  style: "destructive",
                  onPress: clearPurchaseHistory,
                },
              ])
            }
          />

          <DangerRow
            icon="barcode-outline"
            label="Borrar historial de escaneos"
            onPress={() =>
              safeAlert("Borrar historial de escaneos", "¿Seguro?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Borrar",
                  style: "destructive",
                  onPress: clearScannedHistory,
                },
              ])
            }
          />

          <DangerRow
            icon="refresh-outline"
            label="Recargar tiendas desde datos iniciales"
            onPress={() =>
              safeAlert(
                "Recargar tiendas",
                "Se eliminarán los cambios locales en tiendas y se volverán a cargar desde los datos iniciales. ¿Continuar?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Recargar",
                    style: "destructive",
                    onPress: async () => {
                      await clearStoresData();

                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: ROUTES.SHOPPING_TAB,
                            params: { screen: ROUTES.SHOPPING_LISTS },
                          },
                        ],
                      });
                    },
                  },
                ],
              )
            }
          />

          <DangerRow
            icon="close-circle-outline"
            label="Borrar almacenamiento completo"
            onPress={() =>
              safeAlert(
                "Borrar almacenamiento",
                "¿Seguro? Esta acción no se puede deshacer.",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Borrar todo",
                    style: "destructive",
                    onPress: async () => {
                      await clearStorage();

                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: ROUTES.SHOPPING_TAB,
                            params: { screen: ROUTES.SHOPPING_LISTS },
                          },
                        ],
                      });
                    },
                  },
                ],
              )
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    paddingLeft: 16,
    paddingVertical: 12,
  },

  rowIcon: {
    marginRight: 12,
  },

  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#ffe4e6",
  },

  dangerText: {
    flex: 1,
    fontSize: 16,
    color: "#b91c1c",
    fontWeight: "700",
  },
});
