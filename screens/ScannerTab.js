import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
} from "react-native";

import BarcodeScanner from "../components/BarcodeScanner";
import { fetchProductInfo } from "./ProductLookup";
import SEARCH_ENGINES from "../data/search_engines.json";
//import { addScannedProduct } from "../utils/storageHelpers";
import { addScannedProductFull } from "../utils/storage/scannerHistory";
import { useConfig } from "../context/ConfigContext";

export default function ScannerTab({ navigation }) {
  const { config } = useConfig();

  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedSearch, setSelectedSearch] = useState(SEARCH_ENGINES[0]);

  const abortController = useRef(null);
  const checkAnim = useRef(new Animated.Value(0)).current;

  // ⭐ Cuando el código es leído
  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);
    setProduct(null);
    setLastCode(data);

    // ✔ Animación del check
    Animated.sequence([
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(checkAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    abortController.current = new AbortController();

    const info = await fetchProductInfo(
      data,
      abortController.current.signal,
      config
    );

    if (info) {
      setProduct(info);
      await addScannedProductFull({
        code: data,
        name: info.name,
        brand: info.brand,
        image: info.image,
        url: info.url,
      });
    } else {
      setMessage("Búsqueda cancelada o no encontrada");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <BarcodeScanner
        onScanned={handleBarcodeScanned}
        onReenable={() => {
          abortController.current?.abort();
          setScanned(false);
          setProduct(null);
          setLastCode(null);
          setMessage("📸 Listo para nuevo escaneo");
          setTimeout(() => setMessage(""), 2000);
        }}
        onCancel={() => {
          abortController.current?.abort();
          navigation.goBack();
        }}
      />

      {/* Indicador de reescaneo */}
      {!scanned && (
        <Text style={styles.hintText}>Apunta al código para escanear</Text>
      )}
      {scanned && (
        <Text style={styles.hintText}>
          Pulsa el botón central para nuevo escaneo
        </Text>
      )}

      {/* Animación ✔ */}
      <Animated.View
        style={{
          position: "absolute",
          top: "35%",
          left: 0,
          right: 0,
          alignItems: "center",
          opacity: checkAnim,
        }}
      >
        <Text style={{ color: "#22c55e", fontSize: 60 }}>✔</Text>
      </Animated.View>

      {/* Info Box */}
      {lastCode && (
        <View style={styles.infoBox}>
          <Text style={styles.codeTitle}>Código escaneado: {lastCode}</Text>

          {/* 🔎 Selector de motores de búsqueda */}
          <View style={styles.searchSelector}>
            {SEARCH_ENGINES.map((engine) => {
              const active = selectedSearch.id === engine.id;

              return (
                <Pressable
                  key={engine.id}
                  style={[
                    styles.searchButton,
                    active && styles.searchButtonActive,
                  ]}
                  onPress={() => {
                    abortController.current?.abort();
                    setSelectedSearch(engine);
                    setMessage("Buscando con: " + engine.name);
                    setTimeout(() => setMessage(""), 1500);
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
              <Text style={styles.productBrand}>{product.brand}</Text>

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

      {/* Mensaje flotante */}
      {message ? <Text style={styles.floatMsg}>{message}</Text> : null}
    </View>
  );
}

//
// 🎨 ESTILOS
//
const styles = StyleSheet.create({
  hintText: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    color: "white",
    backgroundColor: "#0006",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    fontSize: 14,
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

  // 🔎 Menú de motores
  searchSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },

  searchButton: {
    backgroundColor: "#1f2937", // gris oscuro
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  searchButtonActive: {
    backgroundColor: "#2563eb", // azul seleccionado
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

  floatMsg: {
    position: "absolute",
    bottom: 80,
    color: "white",
    backgroundColor: "#0007",
    padding: 6,
    borderRadius: 8,
    alignSelf: "center",
  },
});
