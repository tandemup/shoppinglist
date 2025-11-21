import React, { useState, useRef } from "react";
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
import { fetchProductInfo } from "./ProductLookup";
import SEARCH_ENGINES from "../data/search_engines.json";
import { addScannedProduct } from "../utils/storageHelpers";
import { useConfig } from "../context/ConfigContext";
import Ionicons from "@expo/vector-icons/Ionicons";

//
// 📘 Detectar si un código es ISBN (EAN-13 con 978/979)
//
function isISBN(code) {
  return (
    code &&
    code.length === 13 &&
    (code.startsWith("978") || code.startsWith("979"))
  );
}

export default function ScannerTab({ navigation }) {
  const { config } = useConfig();

  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [lastCode, setLastCode] = useState(null);

  // mensaje inferior unificado
  const [message, setMessage] = useState("");

  const [selectedSearch, setSelectedSearch] = useState(null);
  const [engines, setEngines] = useState(SEARCH_ENGINES);

  const abortController = useRef(null);
  const checkAnim = useRef(new Animated.Value(0)).current;

  // bloquear sobrescritura si el usuario toca un motor
  const userSelectedEngineRef = useRef(false);

  //
  // ⭐ Cuando el código es leído
  //
  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);
    setProduct(null);
    setLastCode(data);
    userSelectedEngineRef.current = false;

    // ✔ Animación de check
    Animated.sequence([
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(600),
      Animated.timing(checkAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    abortController.current = new AbortController();

    //
    // 📘 Motores según sea libro o no
    //
    if (isISBN(data)) {
      const bookEngines = SEARCH_ENGINES.filter((e) => e.forBooks);
      setEngines(bookEngines);
      setSelectedSearch(bookEngines[0]);
    } else {
      const genericEngines = SEARCH_ENGINES.filter((e) => !e.forBooks);
      setEngines(genericEngines);
      setSelectedSearch(genericEngines[0]);
    }

    //
    // 🔍 Búsqueda automática (solo si no pulsas motor)
    //
    const info = await fetchProductInfo(
      data,
      abortController.current.signal,
      config
    );

    if (info && !userSelectedEngineRef.current) {
      setProduct(info);

      await addScannedProduct({
        code: data,
        name: info.name,
        brand: info.brand,
        image: info.image,
        url: info.url,
      });
    } else if (!info) {
      setMessage("❌ No encontrado");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  //
  // UI principal
  //
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <BarcodeScanner
        onScanned={handleBarcodeScanned}
        onReenable={() => {
          userSelectedEngineRef.current = false;
          abortController.current?.abort();
          setScanned(false);
          setProduct(null);
          setLastCode(null);

          setMessage("📸 Listo para nuevo escaneo");
          setTimeout(() => setMessage(""), 1500);
        }}
        onCancel={() => {
          abortController.current?.abort();
          navigation.goBack();
        }}
      />

      {/* 🔳 Mensaje inferior unificado */}
      <View
        style={{
          position: "absolute",
          bottom: 70,
          alignSelf: "center",
          zIndex: 20,
        }}
      >
        <Text style={styles.hintText}>
          {message
            ? message
            : scanned
            ? "Pulsa el botón central para nuevo escaneo"
            : "Apunta al código para escanear"}
        </Text>
      </View>

      {scanned && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "35%",
            left: 0,
            right: 0,
            alignItems: "center",
            transform: [
              {
                scale: checkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1.25],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              padding: 32,
              borderRadius: 120,
              backgroundColor: "rgba(0,0,0,0.55)",
              borderWidth: 3,
              borderColor: "rgba(255,255,255,0.45)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="checkmark"
              size={100}
              color="#22ff88"
              style={{
                textShadowColor: "rgba(34,255,136,1)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 40,
              }}
            />
          </View>
        </Animated.View>
      )}

      {/* 🔎 Info del producto */}
      {lastCode && (
        <View style={styles.infoBox}>
          <Text style={styles.codeTitle}>Código escaneado: {lastCode}</Text>

          {/* Motores dinámicos */}
          <View style={styles.searchSelector}>
            {engines.map((engine) => {
              const active = selectedSearch?.id === engine.id;

              return (
                <Pressable
                  key={engine.id}
                  style={[
                    styles.searchButton,
                    active && styles.searchButtonActive,
                  ]}
                  onPress={() => {
                    userSelectedEngineRef.current = true;
                    abortController.current?.abort();

                    setSelectedSearch(engine);

                    setMessage("Buscando con: " + engine.name);
                    setTimeout(() => setMessage(""), 1200);

                    setProduct({
                      name: "Abrir en " + engine.name,
                      brand: "",
                      image: null,
                      url: engine.baseUrl + lastCode,
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.searchButtonText,
                      active && styles.searchButtonTextActive,
                    ]}
                  >
                    {engine.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Resultado */}
          {product && (
            <>
              <Text style={styles.productName}>{product.name}</Text>
              {product.brand ? (
                <Text style={styles.productBrand}>{product.brand}</Text>
              ) : null}

              {product.image && (
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
              )}

              <Pressable
                onPress={() => Linking.openURL(product.url)}
                style={styles.openLinkBtn}
              >
                <Text style={styles.openLinkText}>🌐 Abrir enlace</Text>
              </Pressable>
            </>
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
  hintText: {
    color: "white",
    backgroundColor: "#0008",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center",
  },

  infoBox: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 14,
  },

  codeTitle: {
    color: "#22c55e",
    fontSize: 16,
  },

  searchSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  searchButton: {
    backgroundColor: "#1f2937",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  searchButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1e40af",
    borderWidth: 1.4,
  },

  searchButtonText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },

  searchButtonTextActive: {
    color: "white",
    fontWeight: "700",
  },

  productName: {
    color: "white",
    fontSize: 20,
    marginTop: 10,
  },

  productBrand: {
    color: "#bbb",
  },

  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },

  openLinkBtn: {
    backgroundColor: "#2563eb",
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
  },

  openLinkText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
