// screens/MenuScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeAlert } from "../utils/safeAlert";

const clearStorage0 = async () => {
  const confirmDelete =
    Platform.OS === "web"
      ? window.confirm(
          "¿Seguro que deseas borrar todos los datos locales (listas, historial, escaneos)?"
        )
      : await new Promise((resolve) => {
          safeAlert(
            "Borrar almacenamiento",
            "¿Seguro que deseas borrar todos los datos locales (listas, historial, escaneos)?",
            [
              {
                text: "Cancelar",
                style: "cancel",
                onPress: () => resolve(false),
              },
              {
                text: "Borrar todo",
                style: "destructive",
                onPress: () => resolve(true),
              },
            ]
          );
        });

  if (!confirmDelete) return;

  try {
    const keysToRemove = [
      "shoppingLists", // ✅ Listas modernas
      "shoppinglist.v2.items", // 🕰️ Listas antiguas
      "purchaseHistory", // 🧾 Historial de compras
      "scannedProducts", // 📷 Escaneos
    ];

    await AsyncStorage.multiRemove(keysToRemove);

    // Mostrar confirmación final multiplataforma
    if (Platform.OS === "web") {
      safeAlert("✅ Todo el almacenamiento local ha sido borrado.");
    } else {
      safeAlert("Listo", "Todo el almacenamiento local ha sido borrado.");
    }
  } catch (error) {
    console.error("Error borrando AsyncStorage:", error);
    if (Platform.OS === "web") {
      safeAlert("❌ Error al borrar almacenamiento.");
    } else {
      safeAlert("Error", "No se pudo borrar el almacenamiento.");
    }
  }
};

const clearStorage = async () => {
  await AsyncStorage.removeItem("shopping_lists");
  await AsyncStorage.removeItem("lists");
};

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ShoppingLists")}
      >
        <Text style={styles.buttonText}>📋 Mis listas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("PurchaseHistory")}
      >
        <Text style={styles.buttonText}>🧾 Historial de compras</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ScannedHistory")}
      >
        <Text style={styles.buttonText}>🏪 Historial scanned</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => safeAlert("Configuración próximamente")}
      >
        <Text style={styles.buttonText}>⚙️ Configuración</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={clearStorage}
      >
        <Text style={styles.buttonText}>🧹 Borrar almacenamiento local</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
