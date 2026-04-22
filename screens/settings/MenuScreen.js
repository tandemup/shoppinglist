import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Fontisto from "@expo/vector-icons/Fontisto";
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

import {
  getSearchSettings,
  setSearchSettings,
} from "../../src/storage/settingsStorage";

import {
  SEARCH_ENGINES,
  BOOK_ENGINES,
  DEFAULT_ENGINE,
  DEFAULT_BOOK_ENGINE,
} from "../../constants/searchEngines";

const ICON_FAMILIES = {
  Ionicons,
  Fontisto,
};

export default function MenuScreen({ navigation }) {
  const [generalEngine, setGeneralEngineState] = useState(DEFAULT_ENGINE);
  const [bookEngine, setBookEngineState] = useState(DEFAULT_BOOK_ENGINE);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSearchSettings();

      setGeneralEngineState(settings?.generalEngine || DEFAULT_ENGINE);
      setBookEngineState(settings?.bookEngine || DEFAULT_BOOK_ENGINE);
    } catch (error) {
      console.warn("Error cargando ajustes de búsqueda", error);
      setGeneralEngineState(DEFAULT_ENGINE);
      setBookEngineState(DEFAULT_BOOK_ENGINE);
    }
  };

  const selectGeneralEngine = async (id) => {
    try {
      const current = await getSearchSettings();
      await setSearchSettings({
        ...current,
        generalEngine: id,
      });
      setGeneralEngineState(id);
    } catch (error) {
      console.warn("Error guardando motor general", error);
      safeAlert("Error", "No se pudo guardar el motor de búsqueda");
    }
  };

  const selectBookEngine = async (id) => {
    try {
      const current = await getSearchSettings();
      await setSearchSettings({
        ...current,
        bookEngine: id,
      });
      setBookEngineState(id);
    } catch (error) {
      console.warn("Error guardando motor de libros", error);
      safeAlert("Error", "No se pudo guardar el motor para libros");
    }
  };

  const Row = ({ family = "Ionicons", icon, label, onPress }) => {
    const Icon = ICON_FAMILIES[family] || Ionicons;

    return (
      <TouchableOpacity style={styles.row} onPress={onPress}>
        <Icon name={icon} size={20} color="#2563eb" style={styles.rowIcon} />
        <Text style={styles.rowText}>{label}</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  const EngineOption = ({ engine, selectedId, onSelect }) => {
    const selected = selectedId === engine.id;
    const Icon = ICON_FAMILIES[engine.family] || Ionicons;

    return (
      <TouchableOpacity
        style={styles.configRow}
        onPress={() => onSelect(engine.id)}
      >
        <View style={styles.configLeft}>
          <Icon
            name={engine.icon}
            size={20}
            color={selected ? "#2563eb" : "#666"}
            style={styles.engineIcon}
          />
          <Text style={styles.configLabel}>{engine.label}</Text>
        </View>

        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  const DangerRow = ({ family = "Ionicons", icon, label, onPress }) => {
    const Icon = ICON_FAMILIES[family] || Ionicons;

    return (
      <TouchableOpacity style={styles.dangerRow} onPress={onPress}>
        <Icon name={icon} size={20} color="#b91c1c" style={styles.rowIcon} />
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
          <Text style={styles.sectionTitle}>Motor de búsqueda general</Text>
          {Object.values(SEARCH_ENGINES).map((engine) => (
            <EngineOption
              key={engine.id}
              engine={engine}
              selectedId={generalEngine}
              onSelect={selectGeneralEngine}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motor para libros</Text>
          {Object.values(BOOK_ENGINES).map((engine) => (
            <EngineOption
              key={engine.id}
              engine={engine}
              selectedId={bookEngine}
              onSelect={selectBookEngine}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mantenimiento</Text>

          <DangerRow
            icon="trash"
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
            icon="trash-bin"
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
            icon="documents"
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
            icon="barcode"
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
            icon="refresh"
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
            icon="close-circle"
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
  engineIcon: {
    marginRight: 10,
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
  radioSelected: {
    borderColor: "#2563eb",
  },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: "#2563eb",
    borderRadius: 6,
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
