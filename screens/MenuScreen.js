import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import AppIcon from "../components/AppIcon";

export default function MenuScreen({ navigation }) {
  const menuItems = [
    {
      label: "Configuración",
      icon: "menu",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      label: "Tiendas",
      icon: "storefront-outline",
      onPress: () => navigation.navigate("StoresHome"),
    },
    {
      label: "Listas archivadas",
      icon: "cube-outline",
      onPress: () => navigation.navigate("ArchivedLists"),
    },
  ];

  const dangerItems = [
    {
      label: "Borrar todos los datos",
      icon: "trash",
      warningIcon: "warning",
      onPress: () => {
        // lógica existente
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.row} onPress={item.onPress}>
          <AppIcon
            name={item.icon}
            size={20}
            color="#2563eb"
            style={styles.rowIcon}
          />

          <Text style={styles.rowText}>{item.label}</Text>

          <AppIcon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      ))}

      <View style={styles.separator} />

      {dangerItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.dangerRow}
          onPress={item.onPress}
        >
          <AppIcon
            name={item.icon}
            size={20}
            color="#b91c1c"
            style={styles.rowIcon}
          />

          <Text style={styles.dangerText}>{item.label}</Text>

          <AppIcon name={item.warningIcon} size={20} color="#b91c1c" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  rowIcon: {
    marginRight: 12,
  },

  rowText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  dangerText: {
    flex: 1,
    fontSize: 16,
    color: "#b91c1c",
    fontWeight: "600",
  },

  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
});
