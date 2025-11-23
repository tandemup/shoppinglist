// screens/MenuScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { safeAlert } from "../utils/safeAlert";
import { storageClient } from "../utils/storage/storageClient";
import { clearStorage } from "../utils/storage/clearStorage";

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
