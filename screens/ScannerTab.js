// screens/ScannerTab.js
//import React, { useState, useRef } from "react";
//import { View, Text, Pressable, Animated, Image } from "react-native";
//import BarcodeScanner from "../components/BarcodeScanner";
//import { fetchProductInfo, SEARCH_ENGINES, buildSearchUrl } from "./ProductLookup";
//import { useConfig } from "../context/ConfigContext";

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Linking,
} from "react-native";

import BarcodeScanner from "../components/BarcodeScanner";
import {
  SEARCH_ENGINES,
  fetchProductInfo,
  buildSearchUrl,
} from "./ProductLookup";
import { useConfig } from "../context/ConfigContext";

//import { useCameraPermissions } from "expo-camera";
//import { useFocusEffect } from "@react-navigation/native";
//import * as ScreenOrientation from "expo-screen-orientation";
//import AsyncStorage from "@react-native-async-storage/async-storage";
//import * as Clipboard from "expo-clipboard";
//import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ScannerTab({ navigation }) {
  const { config } = useConfig();

  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [lastCode, setLastCode] = useState(null);
  const [message, setMessage] = useState("");

  const abortController = useRef(null);

  const checkAnim = useRef(new Animated.Value(0)).current;

  // ⭐ Lógica cuando el escáner detecta código
  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;

    setScanned(true);
    setProduct(null);
    setLastCode(data);

    // Animación ✔️
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

    // Cancelador de búsqueda
    abortController.current = new AbortController();

    const info = await fetchProductInfo(
      data,
      abortController.current.signal,
      config
    );

    if (info) {
      setProduct(info);
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
          setScanned(false);
          setProduct(null);
          setLastCode(null);
        }}
        onCancel={() => {
          abortController.current?.abort();
          navigation.goBack();
        }}
      />

      {/* Animación del check */}
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

      {/* Panel con información */}
      {lastCode && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 20,
            right: 20,
            padding: 16,
            backgroundColor: "#0008",
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#22c55e", fontSize: 18 }}>
            Código: {lastCode}
          </Text>

          {/* Listado de motores */}
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}
          >
            {SEARCH_ENGINES.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => {
                  abortController.current?.abort();
                  setMessage("Buscando con: " + e.name);
                  setTimeout(() => setMessage(""), 2000);
                  setProduct(null);
                  setProduct({
                    name: "Abrir en " + e.name,
                    brand: "",
                    image: null,
                    url: e.baseUrl + lastCode,
                  });
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "#333",
                  borderRadius: 8,
                  margin: 4,
                }}
              >
                <Text style={{ color: "white" }}>{e.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Resultado */}
          {product && (
            <>
              <Text style={{ color: "white", fontSize: 20, marginTop: 10 }}>
                {product.name}
              </Text>
              <Text style={{ color: "#bbb" }}>{product.brand}</Text>

              {product.image && (
                <Image
                  source={{ uri: product.image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                />
              )}

              <Pressable
                onPress={() => {
                  abortController.current?.abort();
                  Linking.openURL(product.url);
                }}
                style={{
                  backgroundColor: "#2563eb",
                  marginTop: 10,
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  🌐 Abrir enlace
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* Mensaje inferior */}
      {message ? (
        <Text
          style={{
            position: "absolute",
            bottom: 80,
            color: "white",
            backgroundColor: "#0007",
            padding: 6,
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          {message}
        </Text>
      ) : null}
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
