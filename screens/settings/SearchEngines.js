// screens/settings/SearchEngines.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

import {
  getSearchSettings,
  setSearchSettings,
  DEFAULT_SEARCH_SETTINGS,
} from "../../src/storage/settingsStorage";

import { SEARCH_ENGINES, BOOK_ENGINES } from "../../constants/searchEngines";

export default function SearchEngines() {
  const [settings, setSettings] = useState(DEFAULT_SEARCH_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  /* ---------------------------
     Load
  ----------------------------*/
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getSearchSettings();
        setSettings(data);
      } catch (err) {
        console.log("❌ Error loading search settings:", err);
        setSettings(DEFAULT_SEARCH_SETTINGS);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  /* ---------------------------
     Save helper
  ----------------------------*/
  const saveSettings = async (updated) => {
    try {
      setSettings(updated);

      if (!isReady) return;

      await setSearchSettings(updated);
    } catch (err) {
      console.log("❌ Error saving search settings:", err);
    }
  };

  /* ---------------------------
     Toggle
  ----------------------------*/
  const toggleEngine = (category, key) => {
    const currentValue = Boolean(settings?.[category]?.[key]);

    const updated = {
      ...settings,
      [category]: {
        ...(settings?.[category] ?? {}),
        [key]: !currentValue,
      },
    };

    saveSettings(updated);
  };

  /* ---------------------------
     Render helpers
  ----------------------------*/
  const renderEngineRow = ({ category, engine }) => {
    const value = Boolean(settings?.[category]?.[engine.id]);

    return (
      <View style={styles.row} key={engine.id}>
        <View style={styles.rowText}>
          <Text style={styles.label}>{engine.label}</Text>
          <Text style={styles.engineId}>{engine.id}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={() => toggleEngine(category, engine.id)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Motor de búsqueda</Text>

        <Text style={styles.subtitle}>
          Selecciona qué motores estarán disponibles al buscar productos,
          códigos de barras o libros.
        </Text>

        <Text style={styles.sectionTitle}>Productos</Text>

        {Object.values(SEARCH_ENGINES).map((engine) =>
          renderEngineRow({
            category: "productEngines",
            engine,
          }),
        )}

        <Text style={styles.sectionTitle}>Libros</Text>

        {Object.values(BOOK_ENGINES).map((engine) =>
          renderEngineRow({
            category: "bookEngines",
            engine,
          }),
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 18,
    marginBottom: 10,
  },

  row: {
    minHeight: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rowText: {
    flex: 1,
    paddingRight: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },

  engineId: {
    fontSize: 13,
    color: "#6B7280",
  },
});
