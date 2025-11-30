// screens/MenuScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { safeAlert } from "../utils/safeAlert";
import { useStore } from "../context/StoreContext"; // ✅ IMPORTACIÓN CORRECTA
import { clearStorage } from "../utils/storage/clearStorage";

export default function MenuScreen({ navigation }) {
  // ⬅️ OBTENER MÉTODOS DEL STORE
  const {
    clearActiveLists,
    clearArchivedLists,
    clearPurchaseHistory,
    clearScannedHistory,
  } = useStore();

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
        onPress={() => navigation.navigate("ArchivedLists")}
      >
        <Text style={styles.buttonText}>📋 Mis listas archivadas</Text>
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

      {/* ⭐ BORRADO SELECTIVO */}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={() =>
          safeAlert(
            "Borrar listas activas",
            "¿Seguro que quieres borrar TODAS las listas activas?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Borrar",
                style: "destructive",
                onPress: clearActiveLists,
              },
            ]
          )
        }
      >
        <Text style={styles.buttonText}>🗑 Borrar listas activas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={() =>
          safeAlert(
            "Borrar listas archivadas",
            "¿Seguro que quieres borrar TODAS las listas archivadas?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Borrar",
                style: "destructive",
                onPress: clearArchivedLists,
              },
            ]
          )
        }
      >
        <Text style={styles.buttonText}>📦 Borrar listas archivadas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={() =>
          safeAlert(
            "Borrar historial de compras",
            "¿Seguro que quieres borrar TODO el historial de compras?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Borrar",
                style: "destructive",
                onPress: clearPurchaseHistory,
              },
            ]
          )
        }
      >
        <Text style={styles.buttonText}>🧾 Borrar historial de compras</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={() =>
          safeAlert(
            "Borrar historial de escaneos",
            "¿Seguro que quieres borrar TODO el historial de escaneos?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Borrar",
                style: "destructive",
                onPress: clearScannedHistory,
              },
            ]
          )
        }
      >
        <Text style={styles.buttonText}>📷 Borrar historial de escaneos</Text>
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

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
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
