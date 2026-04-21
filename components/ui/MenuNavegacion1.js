import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../navigation/ROUTES";

export default function MenuNavegacion1() {
  const navigation = useNavigation();

  const Row = ({ icon, label, route }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        navigation.navigate(ROUTES.SHOPPING_TAB, {
          screen: route,
        })
      }
    >
      <Ionicons name={icon} size={20} color="#2563eb" style={styles.rowIcon} />
      <Text style={styles.rowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Navegación</Text>

      <Row
        icon="list-outline"
        label="Mis listas"
        route={ROUTES.SHOPPING_LISTS}
      />
      <Row
        icon="archive-outline"
        label="Listas archivadas"
        route={ROUTES.ARCHIVED_LISTS}
      />
      <Row
        icon="receipt-outline"
        label="Historial de compras"
        route={ROUTES.PURCHASE_HISTORY}
      />
      <Row
        icon="barcode-outline"
        label="Historial de escaneos"
        route={ROUTES.SCANNED_HISTORY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
  },

  rowIcon: {
    marginRight: 12,
  },

  rowText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});
