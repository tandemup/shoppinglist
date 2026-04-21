import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../../navigation/ROUTES";

export default function MenuNavegacion2({
  archivedCount = 0,
  historyCount = 0,
  scannedCount = 0,
}) {
  const navigation = useNavigation();

  const actions = [
    {
      key: "lists",
      label: "Mis Listas",
      icon: "list-outline",
      route: ROUTES.SHOPPING_LISTS,
    },
    {
      key: "archived",
      label: "Archivadas",
      icon: "archive-outline",
      route: ROUTES.ARCHIVED_LISTS,
      badge: archivedCount,
    },
    {
      key: "history",
      label: "Compras",
      icon: "receipt-outline",
      route: ROUTES.PURCHASE_HISTORY,
      badge: historyCount,
    },
    {
      key: "scanned",
      label: "Escaneos",
      icon: "barcode-outline",
      route: ROUTES.SCANNED_HISTORY,
      badge: scannedCount,
    },
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Accesos rápidos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={() =>
              navigation.navigate(ROUTES.SHOPPING_TAB, { screen: action.route })
            }
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.iconBox}>
              <Ionicons name={action.icon} size={22} color="#2563eb" />

              {action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {action.badge > 99 ? "99+" : action.badge}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  scroll: {
    gap: 12,
    paddingRight: 16,
  },

  card: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  cardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },

  iconBox: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
