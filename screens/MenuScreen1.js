import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { useConfig } from "../context/ConfigContext";

export default function MenuScreen() {
  const { config, updateConfig } = useConfig();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Configuración</Text>

      {/* Dark Mode */}
      <View style={styles.row}>
        <Text style={styles.label}>Tema oscuro</Text>
        <Switch
          value={config.ui.darkMode}
          onValueChange={(v) =>
            updateConfig({ ...config, ui: { ...config.ui, darkMode: v } })
          }
        />
      </View>

      {/* Autofoco */}
      <View style={styles.row}>
        <Text style={styles.label}>Autofocus</Text>
        <Switch
          value={config.scanner.autoFocus}
          onValueChange={(v) =>
            updateConfig({
              ...config,
              scanner: { ...config.scanner, autoFocus: v },
            })
          }
        />
      </View>

      {/* Animación de Check */}
      <View style={styles.row}>
        <Text style={styles.label}>Animación al escanear</Text>
        <Switch
          value={config.ui.showScanAnimation}
          onValueChange={(v) =>
            updateConfig({
              ...config,
              ui: { ...config.ui, showScanAnimation: v },
            })
          }
        />
      </View>

      {/* Zoom automático */}
      <View style={styles.row}>
        <Text style={styles.label}>Zoom automático</Text>
        <Switch
          value={config.scanner.zoomAuto}
          onValueChange={(v) =>
            updateConfig({
              ...config,
              scanner: { ...config.scanner, zoomAuto: v },
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: { fontSize: 18 },
});
