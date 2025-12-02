// screens/MenuScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { safeAlert } from "../utils/safeAlert";
import { useStore } from "../context/StoreContext";
import { clearStorage } from "../utils/storage/clearStorage";

export default function MenuScreen({ navigation }) {
  const {
    clearActiveLists,
    clearArchivedLists,
    clearPurchaseHistory,
    clearScannedHistory,
  } = useStore();

  const [maintenanceOpen, setMaintenanceOpen] = useState(false); // ⭐ ACORDEÓN

  const Row = ({ icon, label, color = "#007bff", onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color={color} style={styles.rowIcon} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

  const DangerRow = ({ icon, label, onPress }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: "#fee2e2" }]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color="#b91c1c" style={styles.rowIcon} />
      <Text style={[styles.rowText, { color: "#b91c1c", fontWeight: "700" }]}>
        {label}
      </Text>
      <Ionicons name="warning" size={20} color="#b91c1c" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Menú</Text>

        {/* 📋 NAVEGACIÓN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Navegación</Text>

          <Row
            icon="list"
            label="Mis listas"
            onPress={() => navigation.navigate("ShoppingLists")}
          />

          <Row
            icon="archive"
            label="Listas archivadas"
            onPress={() => navigation.navigate("ArchivedLists")}
          />

          <Row
            icon="receipt"
            label="Historial de compras"
            onPress={() => navigation.navigate("PurchaseHistory")}
          />

          <Row
            icon="barcode"
            label="Historial de escaneos"
            onPress={() => navigation.navigate("ScannedHistory")}
          />

          <Row
            icon="settings"
            label="Configuración (próximamente)"
            color="#777"
            onPress={() => safeAlert("Configuración próximamente")}
          />
        </View>

        {/* ⚠️ ACORDEÓN DE MANTENIMIENTO */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setMaintenanceOpen((prev) => !prev)}
          >
            <Text style={styles.sectionTitle}>⚠️ Mantenimiento</Text>
            <Ionicons
              name={maintenanceOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {maintenanceOpen && (
            <View>
              <DangerRow
                icon="trash"
                label="Borrar listas activas"
                onPress={() =>
                  safeAlert(
                    "Borrar listas activas",
                    "¿Seguro que quieres borrar TODAS las listas activas?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Borrar",
                        style: "destructive",
                        onPress: () => clearActiveLists(),
                      },
                    ]
                  )
                }
              />

              <DangerRow
                icon="trash-bin"
                label="Borrar listas archivadas"
                onPress={() =>
                  safeAlert(
                    "Borrar listas archivadas",
                    "¿Seguro que quieres borrar TODAS las listas archivadas?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Borrar",
                        style: "destructive",
                        onPress: () => clearArchivedLists(),
                      },
                    ]
                  )
                }
              />

              <DangerRow
                icon="documents"
                label="Borrar historial de compras"
                onPress={() =>
                  safeAlert(
                    "Borrar historial de compras",
                    "¿Seguro que quieres borrar TODO el historial de compras?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Borrar",
                        style: "destructive",
                        onPress: () => clearPurchaseHistory(),
                      },
                    ]
                  )
                }
              />

              <DangerRow
                icon="trash-outline"
                label="Borrar historial de escaneos"
                onPress={() =>
                  safeAlert(
                    "Borrar historial de escaneos",
                    "¿Seguro que quieres borrar TODO el historial de escaneos?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Borrar",
                        style: "destructive",
                        onPress: () => clearScannedHistory(),
                      },
                    ]
                  )
                }
              />

              <DangerRow
                icon="remove-circle"
                label="Borrar almacenamiento completo"
                onPress={async () => {
                  try {
                    await clearStorage();
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "ShoppingLists" }],
                    });
                  } catch (e) {
                    console.log("Error limpiando almacenamiento:", e);
                  }
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "700",
    paddingLeft: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 16,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f3f3",
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
});
