import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Linking,
  ScrollView,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BarcodeScanner from "../components/BarcodeScanner";
import {
  SEARCH_ENGINES,
  fetchProductInfo,
  buildSearchUrl,
} from "./ProductLookup";

export default function ScannerTab({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedSearch, setSelectedSearch] = useState(SEARCH_ENGINES[0]);
  const [checkAnim] = useState(new Animated.Value(0));
  const [showLocalHistory, setShowLocalHistory] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isFocused, setIsFocused] = useState(true); // 👈 control de cámara

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    requestPermission();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    return () => ScreenOrientation.unlockAsync();
  }, []);

  const saveProduct = async (code, productData) => {
    try {
      const stored = await AsyncStorage.getItem("scannedProducts");
      const products = stored ? JSON.parse(stored) : [];
      if (products.some((p) => p.code === code)) return;
      const newProduct = {
        code,
        name: productData?.name || "",
        brand: productData?.brand || "",
        url: productData?.url || buildSearchUrl("openfoodfacts", code),
        date: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        "scannedProducts",
        JSON.stringify([newProduct, ...products])
      );
    } catch (err) {
      console.error("Error guardando producto:", err);
    }
  };

  const loadRecentProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem("scannedProducts");
      const products = stored ? JSON.parse(stored) : [];
      setRecentProducts(products);
    } catch (err) {
      console.error("Error cargando historial:", err);
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem("scannedProducts");
    setRecentProducts([]);
    setMessage("🗑️ Historial borrado");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setLastCode(data);
    setProduct(null);

    // 📚 Detección automática del tipo
    let autoSearch = SEARCH_ENGINES.find((e) => e.id === "googleshopping");
    if (data.startsWith("978") || data.startsWith("979")) {
      autoSearch =
        SEARCH_ENGINES.find((e) => e.id === "googlebooks") || autoSearch;
      setMessage("📚 ISBN detectado");
    } else {
      setMessage("📋 Código de producto detectado");
    }
    setSelectedSearch(autoSearch);

    await Clipboard.setStringAsync(data);

    Animated.sequence([
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(checkAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const info = await fetchProductInfo(data);
      if (info) {
        setProduct(info);
        await saveProduct(data, info);
      } else setMessage("Código no reconocido");
    } catch (error) {
      console.error("❌ Error durante el escaneo:", error);
      setMessage("Error al procesar código");
    } finally {
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleReenableScanner = () => {
    setScanned(false);
    setProduct(null);
    setLastCode(null);
    setMessage("Listo para nuevo escaneo");
    setTimeout(() => setMessage(""), 2000);
  };

  if (!permission)
    return (
      <View style={styles.center}>
        <Text>Solicitando permiso...</Text>
      </View>
    );

  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Text>No se puede acceder a la cámara.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={styles.container}>
      <BarcodeScanner
        onScanned={handleBarcodeScanned}
        onCancel={() => navigation.goBack()}
        onReenable={handleReenableScanner}
        hideScanArea={!!lastCode}
        active={isFocused}
        statusMessage={
          message.includes("ISBN")
            ? "📚 ISBN detectado"
            : message.includes("producto")
            ? "🛍️ Código de producto"
            : ""
        }
        statusColor={
          message.includes("ISBN")
            ? "#16a34a" // verde
            : message.includes("producto")
            ? "#2563eb" // azul
            : "#000000"
        }
      />

      <Animated.View style={[styles.checkOverlay, { opacity: checkAnim }]}>
        <MaterialCommunityIcons
          name="check-circle"
          size={120}
          color="#22c55e"
        />
      </Animated.View>

      {!showLocalHistory && lastCode && (
        <View style={styles.infoBox}>
          <Text style={styles.barcodeText}>📦 {lastCode}</Text>

          <View style={styles.searchSelector}>
            {SEARCH_ENGINES.map((engine) => (
              <Pressable
                key={engine.id}
                style={[
                  styles.searchButton,
                  selectedSearch.id === engine.id && styles.searchButtonActive,
                ]}
                onPress={() => setSelectedSearch(engine)}
              >
                <Text style={styles.searchButtonText}>{engine.name}</Text>
              </Pressable>
            ))}
          </View>

          {product ? (
            <>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productBrand}>{product.brand}</Text>
              {product.image && (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
              )}
              <Pressable
                style={styles.smallButton}
                onPress={() =>
                  Linking.openURL(`${selectedSearch.baseUrl}${lastCode}`)
                }
              >
                <Text style={styles.buttonText}>🌐 Abrir enlace</Text>
              </Pressable>
              <Pressable
                style={[styles.smallButton, { backgroundColor: "#16a34a" }]}
                onPress={async () => {
                  await loadRecentProducts();
                  setShowLocalHistory(true);
                }}
              >
                <Text style={styles.buttonText}>📋 Ver historial local</Text>
              </Pressable>
            </>
          ) : (
            <Text style={{ color: "#ccc", marginTop: 8 }}>
              Buscando producto...
            </Text>
          )}
        </View>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {showLocalHistory && (
        <View style={styles.historyOverlay}>
          <Text style={styles.historyTitle}>📜 Códigos detectados</Text>
          <ScrollView style={{ maxHeight: 350 }}>
            {recentProducts.map((item, idx) => (
              <View key={idx} style={styles.historyRow}>
                <Text style={styles.historyItem}>
                  {item.code} - {item.name || "Sin nombre"}
                </Text>
                {item.date && (
                  <Text style={styles.historyDate}>
                    {new Date(item.date).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
          <Pressable
            style={[styles.smallButton, { marginTop: 10 }]}
            onPress={() => setShowLocalHistory(false)}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
          <Pressable
            style={[
              styles.smallButton,
              { marginTop: 10, backgroundColor: "#dc2626" },
            ]}
            onPress={clearHistory}
          >
            <Text style={styles.buttonText}>🗑️ Borrar historial</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  checkOverlay: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoBox: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    zIndex: 10,
  },
  barcodeText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  productName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  productBrand: {
    color: "#ddd",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  productImage: { width: 80, height: 80, borderRadius: 8, marginBottom: 8 },
  smallButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  searchSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 6,
  },
  searchButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    margin: 4,
  },
  searchButtonActive: { backgroundColor: "#22c55e" },
  searchButtonText: { color: "white", fontSize: 13, fontWeight: "600" },
  message: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 14,
  },
  historyOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    padding: 16,
  },
  historyTitle: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  historyRow: { marginBottom: 6, alignItems: "center" },
  historyItem: { color: "white", fontSize: 14, marginVertical: 2 },
  historyDate: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
});
