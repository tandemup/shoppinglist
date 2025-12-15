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
import { ROUTES } from "../navigation/ROUTES";

import { useCameraPermissions } from "expo-camera";

import BarcodeScanner from "../components/BarcodeScanner";
import { fetchProductInfo } from "./ProductLookup";
import SEARCH_ENGINES from "../data/search_engines.json";
import { addScannedProductFull } from "../utils/storage/scannerHistory";
import { useConfig } from "../context/ConfigContext";
import { isISBN } from "../utils/isISBN";

export default function ScannerTab({ navigation }) {
  const { config } = useConfig();

  // 📌 Permisos
  const [permission, requestPermission] = useCameraPermissions();

  // 📌 Estados
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [isBook, setIsBook] = useState(false); // ⭐ NUEVO

  const abortController = useRef(null);
  const checkAnim = useRef(new Animated.Value(0)).current;

  // ⭐ Grupos de motores según el JSON
  const BOOK_ENGINES = SEARCH_ENGINES.filter((e) => e.forBooks);
  const PRODUCT_ENGINES = SEARCH_ENGINES.filter((e) => !e.forBooks);

  // ⭐ Escaneo
  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);
    setProduct(null);
    setLastCode(data);

    // ✔ Animación de check
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

    // ⭐ Detección ISBN
    const bookDetected = isISBN(data);
    setIsBook(bookDetected);

    if (bookDetected) {
      setSelectedSearch(BOOK_ENGINES[0]);
      setMessage("📚 ISBN detectado — motores de libros activados");
    } else {
      setSelectedSearch(PRODUCT_ENGINES[0]);
      setMessage("🔍 Producto general");
    }
    setTimeout(() => setMessage(""), 2000);

    // ⭐ Lookup real
    const info = await fetchProductInfo(
      data,
      abortController.current.signal,
      config
    );

    if (info) {
      setProduct(info);

      await addScannedProductFull({
        id: Date.now().toString(),
        barcode: data,
        name: info.name,
        brand: info.brand,
        image: info.image,
        url: info.url,
        isBook: bookDetected, // ⭐ NUEVO
        scannedAt: new Date().toISOString(),
        source: "scanner",
      });
    } else {
      setMessage("Búsqueda cancelada o no encontrada");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // 🆕 Permisos cámara
  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: "black" }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: "white",
            marginBottom: 20,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          La app necesita permiso para usar la cámara
        </Text>

        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: "#2563eb",
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
            Conceder permiso
          </Text>
        </Pressable>
      </View>
    );
  }

  // 📸 UI principal
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
          navigation.navigate(ROUTES.LISTAS);
        }}
      />

      {/* Indicador */}
      {!scanned && (
        <Text style={styles.hintText}>Apunta al código para escanear</Text>
      )}
      {scanned && (
        <Text style={styles.hintText}>
          Pulsa el botón central para nuevo escaneo
        </Text>
      )}

      {/* ✔ Animación */}
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

          {/* 🔎 Selector según ISBN */}
          <View style={styles.searchSelector}>
            {(isBook ? BOOK_ENGINES : PRODUCT_ENGINES).map((engine) => {
              const active = selectedSearch?.id === engine.id;

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
