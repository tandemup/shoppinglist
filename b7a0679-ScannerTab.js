// screens/ScannerTab.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Image,
  Linking,
  StyleSheet,
} from "react-native";

import BarcodeScanner from "../components/BarcodeScanner";
import { addScannedProduct } from "../utils/storage/scannerHistory";
import { fetchProductInfo } from "./ProductLookup";
import SEARCH_ENGINES from "../data/search_engines.json";

export default function ScannerTab() {
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  //
  // ⭐ Animación al encontrar un producto
  //
  const animateCheck = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  //
  // 🔍 Evento disparado cuando el scanner detecta un código
  //
  const onScanned = async (code) => {
    setMessage(`Escaneado: ${code}`);

    // Guardar automáticamente en historial
    await addScannedProduct(code);

    // Buscar información del producto
    const info = await fetchProductInfo(code);
    setProduct(info);

    animateCheck();
  };

  //
  // 🌐 Abrir con buscador externo (Google, OpenFoodFacts, etc.)
  //
  const openInSearchEngine = () => {
    if (!selectedEngine || !product) return;

    const engine = SEARCH_ENGINES[selectedEngine];
    const url = engine.url.replace("{code}", product.code);

    Linking.openURL(url);
  };

  //
  // 🧼 Reset de UI tras re-escanear
  //
  const resetUI = () => {
    setProduct(null);
    setSelectedEngine(null);
    setMessage("Listo para nuevo escaneo");
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <View style={styles.container}>
      {/* 📸 Componente Real del Scanner */}
      <BarcodeScanner
        onScanned={onScanned}
        onReenable={resetUI}
        onCancel={() => setMessage("Escaneo cancelado")}
      />

      {/* 💬 Mensaje de estado */}
      {message !== "" && <Text style={styles.message}>{message}</Text>}

      {/* 🟩 Check animado */}
      {product && (
        <Animated.View style={[styles.checkContainer, { opacity: fadeAnim }]}>
          <Image
            source={require("../assets/check.png")}
            style={styles.checkIcon}
          />
        </Animated.View>
      )}

      {/* 🧾 Info del producto (si existe) */}
      {product && (
        <View style={styles.productCard}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productCode}>Código: {product.code}</Text>

          {/* 🔍 Selección de buscador */}
          <View style={styles.engineRow}>
            {Object.keys(SEARCH_ENGINES).map((engineKey) => (
              <Pressable
                key={engineKey}
                style={[
                  styles.engineButton,
                  selectedEngine === engineKey && styles.engineButtonSelected,
                ]}
                onPress={() => setSelectedEngine(engineKey)}
              >
                <Text
                  style={[
                    styles.engineText,
                    selectedEngine === engineKey && styles.engineTextSelected,
                  ]}
                >
                  {SEARCH_ENGINES[engineKey].label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* 🌐 Botón para abrir con el buscador elegido */}
          {selectedEngine && (
            <Pressable style={styles.openBtn} onPress={openInSearchEngine}>
              <Text style={styles.openBtnText}>
                Abrir en {SEARCH_ENGINES[selectedEngine].label}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 12,
  },

  message: {
    color: "white",
    textAlign: "center",
    marginVertical: 8,
    fontSize: 16,
  },

  checkContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  checkIcon: {
    width: 80,
    height: 80,
    tintColor: "#4CAF50",
  },

  productCard: {
    backgroundColor: "#fff",
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productCode: {
    color: "#555",
    marginTop: 4,
  },

  engineRow: {
    flexDirection: "row",
    marginTop: 12,
    flexWrap: "wrap",
  },
  engineButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  engineButtonSelected: {
    backgroundColor: "#2563eb",
  },
  engineText: {
    color: "#111",
  },
  engineTextSelected: {
    color: "white",
    fontWeight: "bold",
  },

  openBtn: {
    backgroundColor: "#2563eb",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  openBtnText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
