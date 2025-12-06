// MenuScreen.js — versión simplificada y scroll corregido
// Basado en la versión original del usuario :contentReference[oaicite:1]{index=1}

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
    config,
    setGeneralEngine,
    setBookEngine,
  } = useStore();

  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  //
  // ROW COMPONENTS (limpios y reutilizables)
  //
  const Row = ({ icon, label, color = "#2563eb", onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} style={styles.rowIcon} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const DangerRow = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.dangerRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#b91c1c" style={styles.rowIcon} />
      <Text style={styles.dangerText}>{label}</Text>
      <Ionicons name="warning" size={20} color="#b91c1c" />
    </TouchableOpacity>
  );

  //
  // Motores de búsqueda
  //
  const generalEngines = [
    { id: "google", label: "Google", icon: "logo-google" },
    { id: "duckduckgo", label: "DuckDuckGo", icon: "search-outline" },
    { id: "bing", label: "Bing", icon: "search" },
    { id: "idealo", label: "Idealo", icon: "pricetag-outline" },
    { id: "carrefour", label: "Carrefour", icon: "basket-outline" },
    { id: "barcodeLookup", label: "BarcodeLookup", icon: "barcode-outline" },
  ];

  const bookEngines = [
    { id: "googleBooks", label: "Google Books", icon: "book-outline" },
    { id: "openLibrary", label: "OpenLibrary", icon: "book-outline" },
    { id: "amazon", label: "Amazon Books", icon: "cart-outline" },
  ];

  const renderEngineOption = (engine, selectedId, onSelect) => {
    const selected = selectedId === engine.id;

    return (
      <TouchableOpacity
        key={engine.id}
        style={styles.configRow}
        onPress={() => onSelect(engine.id)}
      >
        <View style={styles.configLeft}>
          <Ionicons
            name={engine.icon}
            size={20}
            color={selected ? "#2563eb" : "#666"}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.configLabel}>{engine.label}</Text>
        </View>

        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  //
  // UI
  //
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.title}>Menú</Text>

        {/* Navegación */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navegación</Text>

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
        </View>

        {/* Motor general */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setGeneralOpen(!generalOpen)}
          >
            <Text style={styles.sectionTitle}>Motor de búsqueda general</Text>
            <Ionicons
              name={generalOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {generalOpen && (
            <View style={styles.dropdownContent}>
              {generalEngines.map((e) =>
                renderEngineOption(
                  e,
                  config.search?.generalEngine,
                  setGeneralEngine
                )
              )}
            </View>
          )}
        </View>

        {/* Motor de libros */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setBookOpen(!bookOpen)}
          >
            <Text style={styles.sectionTitle}>Motor para libros</Text>
            <Ionicons
              name={bookOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {bookOpen && (
            <View style={styles.dropdownContent}>
              {bookEngines.map((e) =>
                renderEngineOption(e, config.search?.bookEngine, setBookEngine)
              )}
            </View>
          )}
        </View>

        {/* Mantenimiento */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setMaintenanceOpen(!maintenanceOpen)}
          >
            <Text style={styles.sectionTitle}>Mantenimiento</Text>
            <Ionicons
              name={maintenanceOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </TouchableOpacity>

          {maintenanceOpen && (
            <View style={{ marginBottom: 6 }}>
              <DangerRow
                icon="trash"
                label="Borrar listas activas"
                onPress={() =>
                  safeAlert("Borrar listas activas", "¿Seguro?", [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar",
                      style: "destructive",
                      onPress: () => clearActiveLists(),
                    },
                  ])
                }
              />

              <DangerRow
                icon="trash-bin"
                label="Borrar listas archivadas"
                onPress={() =>
                  safeAlert("Borrar listas archivadas", "¿Seguro?", [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar",
                      style: "destructive",
                      onPress: () => clearArchivedLists(),
                    },
                  ])
                }
              />

              <DangerRow
                icon="documents"
                label="Borrar historial de compras"
                onPress={() =>
                  safeAlert("Borrar historial", "¿Seguro?", [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar",
                      style: "destructive",
                      onPress: () => clearPurchaseHistory(),
                    },
                  ])
                }
              />

              <DangerRow
                icon="trash-outline"
                label="Borrar historial de escaneos"
                onPress={() =>
                  safeAlert("Borrar historial", "¿Seguro?", [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar",
                      style: "destructive",
                      onPress: () => clearScannedHistory(),
                    },
                  ])
                }
              />

              <DangerRow
                icon="close-circle"
                label="Borrar almacenamiento completo"
                onPress={async () => {
                  await clearStorage();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "ShoppingLists" }],
                  });
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
// ESTILOS SIMPLIFICADOS
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 20,
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#555",
    paddingLeft: 16,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f3f3",
  },
  rowIcon: { marginRight: 12 },
  rowText: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
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

  configRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f3f3",
  },
  configLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  configLabel: {
    fontSize: 16,
    color: "#222",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: "#2563eb" },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: "#2563eb",
    borderRadius: 6,
  },

  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  dropdownContent: {
    backgroundColor: "#fafafa",
  },
});
