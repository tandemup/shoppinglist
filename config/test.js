// ==============================
// 1. BarcodeScanner.js (Optimizado)
// ==============================

// BarcodeScanner.js actualizado con cancelación de búsqueda
import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { CameraView } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useConfig } from "../context/ConfigContext";

export default function BarcodeScanner({ onScanned, onCancel, onReenable, active = true }) {
  const { config } = useConfig();
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [torch, setTorch] = useState(false);
  const zoomRef = useRef(config.scanner.zoom);
  const zoomDirectionRef = useRef(1);

  useEffect(() => {
    if (!config.scanner.zoomAuto) {
      zoomRef.current = config.scanner.zoom;
      return;
    }

    const interval = setInterval(() => {
      if (!scanningEnabled) return;
      let current = zoomRef.current;
      let dir = zoomDirectionRef.current;
      let next = current + dir * 0.01;

      if (next > 0.28) {
        zoomDirectionRef.current = -1;
        next = 0.28;
      }
      if (next < 0.1) {
        zoomDirectionRef.current = 1;
        next = 0.1;
      }

      zoomRef.current = next;
    }, 400);

    return () => clearInterval(interval);
  }, [scanningEnabled, config.scanner.zoomAuto, config.scanner.zoom]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        zoom={zoomRef.current}
        autoFocus={config.scanner.autoFocus ? "on" : "off"}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: config.scanner.barcodeTypes }}
        onBarcodeScanned={scanningEnabled && active ? onScanned : undefined}
      />

      <View style={{ position: "absolute", bottom: 0, width: "100%", padding: 16, flexDirection: "row", justifyContent: "space-around" }}>
        <Pressable onPress={() => setTorch(t => !t)}>
          <MaterialCommunityIcons name={torch ? "flashlight" : "flashlight-off"} size={28} color="#fff" />
        </Pressable>
        <Pressable onPress={() => { setScanningEnabled(true); onReenable?.(); }}>
          <MaterialCommunityIcons name="barcode" size={28} color="#fff" />
        </Pressable>
        <Pressable onPress={onCancel}>
          <MaterialCommunityIcons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

// ==============================
// 2. ProductLookup.js (Optimizado con Fallbacks y Config)
// ==============================

// ProductLookup.js actualizado con AbortController y configuraciones
import { buildSearchUrl } from "./ProductLookup";
import { useConfig } from "../context/ConfigContext";

export const fetchProductInfo = async (barcode, signal, config) => {
  try {
    if (barcode.startsWith("978") || barcode.startsWith("979")) {
      const r = await fetch(`https://openlibrary.org/isbn/${barcode}.json`, { signal });
      if (r.ok) {
        const d = await r.json();
        return {
          code: barcode,
          name: d.title || "Libro desconocido",
          brand: d.publishers?.join(", ") || "Editorial desconocida",
          image: d.covers ? `https://covers.openlibrary.org/b/id/${d.covers[0]}-M.jpg` : null,
          url: `https://openlibrary.org/isbn/${barcode}`,
        };
      }
    }

    if (config.lookup.primary === "openfoodfacts") {
      const r = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, { signal });
      const data = await r.json();
      if (data.status === 1) {
        const p = data.product;
        return {
          code: barcode,
          name: p.product_name || "Producto desconocido",
          brand: p.brands || "Sin marca",
          image: p.image_small_url,
          url: p.url,
        };
      }
    }

    return {
      code: barcode,
      name: "Producto no encontrado",
      brand: "",
      image: null,
      url: buildSearchUrl(config.lookup.fallback, barcode),
    };
  } catch (err) {
    if (err.name === "AbortError") return null;
    return null;
  }
};

// ==============================
// 3. ScannerTab.js (Integrado con el nuevo sistema Config)
// ==============================

// ScannerTab.js con cancelación de búsqueda programada
import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import BarcodeScanner from "../components/BarcodeScanner";
import { fetchProductInfo } from "./ProductLookup";
import { useConfig } from "../context/ConfigContext";

export default function ScannerTab() {
  const { config } = useConfig();
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [message, setMessage] = useState("");
  const abortController = useRef(null);

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setProduct(null);

    abortController.current = new AbortController();
    const info = await fetchProductInfo(data, abortController.current.signal, config);

    if (info) setProduct(info);
    else setMessage("Búsqueda cancelada o no encontrada");
  };

  return (
    <View style={{ flex: 1 }}>
      <BarcodeScanner
        onScanned={handleBarcodeScanned}
        onReenable={() => { setScanned(false); setProduct(null); }}
        onCancel={() => abortController.current?.abort()}
      />

      {product && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: "white", fontSize: 20 }}>{product.name}</Text>
        </View>
      )}
    </View>
  );
}
