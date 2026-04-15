import BarcodeScanner from "../../components/scanner/BarcodeScanner";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { addScannedItem } from "../../services/scannerHistory";

function BarcodeInfoCard({
  barcode,
  product,
  openingBrowser,
  onSearch,
  onResume,
  onCopy,
}) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 120,
        alignSelf: "center",
        backgroundColor: "rgba(255,255,255,0.5)",
        padding: 16,
        borderRadius: 10,
        minWidth: 260,
        alignItems: "center",
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
        Código detectado:
      </Text>

      <Text style={{ fontSize: 20, marginTop: 6 }}>{barcode}</Text>

      {product?.image ? (
        <Image
          source={{ uri: product.image }}
          style={{
            width: 120,
            height: 120,
            marginTop: 12,
            borderRadius: 8,
          }}
          resizeMode="contain"
        />
      ) : null}

      {product?.name ? (
        <Text
          style={{
            marginTop: 10,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {product.name}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Pressable
          onPress={onSearch}
          disabled={openingBrowser}
          style={{
            backgroundColor: openingBrowser ? "#93c5fd" : "#2563eb",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            opacity: openingBrowser ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {openingBrowser ? "Abriendo..." : "Buscar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={onResume}
          style={{
            backgroundColor: "#111827",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Reanudar</Text>
        </Pressable>

        <Pressable
          onPress={onCopy}
          style={{
            backgroundColor: "#16a34a",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Copiar</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ScannerDetailMode({
  navigation,
  route,
  embedded = false,
}) {
  const itemId = route?.params?.id ?? null;

  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);
  const [openingBrowser, setOpeningBrowser] = useState(false);
  const [product, setProduct] = useState(null);
  const [scannerKey, setScannerKey] = useState(0);

  const isCancellingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const Wrapper = embedded ? View : SafeAreaView;

  useEffect(() => {
    return () => {
      isCancellingRef.current = true;
      abortControllerRef.current?.abort();
    };
  }, []);

  function normalizeBarcode(code) {
    const clean = String(code || "").replace(/\D/g, "");

    if (clean.length === 13) return clean;
    if (clean.length === 8) return clean;

    return null;
  }

  function resetScanState() {
    abortControllerRef.current?.abort();
    setBarcode("");
    setScanned(false);
    setProduct(null);
    setOpeningBrowser(false);
    setScannerKey((prev) => prev + 1);
  }

  function handleCancel() {
    isCancellingRef.current = true;
    abortControllerRef.current?.abort();
    resetScanState();
    navigation.goBack();
  }

  async function copyBarcode(code) {
    if (!code || isCancellingRef.current) return;
    await Clipboard.setStringAsync(code);
  }

  async function openBrowser(code) {
    if (!code || openingBrowser || isCancellingRef.current) return;

    try {
      setOpeningBrowser(true);

      const url = `https://www.google.com/search?q=${encodeURIComponent(code)}`;
      const canOpen = await Linking.canOpenURL(url);

      if (!canOpen || isCancellingRef.current) return;

      await Linking.openURL(url);
    } finally {
      if (!isCancellingRef.current) {
        setOpeningBrowser(false);
      }
    }
  }

  async function fetchProduct(scannedBarcode) {
    try {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${scannedBarcode}.json`,
        { signal: controller.signal },
      );

      if (isCancellingRef.current) return null;

      const json = await res.json();

      if (isCancellingRef.current) return null;

      if (json?.status === 1) {
        return {
          name: json?.product?.product_name || "",
          image: json?.product?.image_url || "",
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  async function handleScanned({ data }) {
    if (scanned || isCancellingRef.current) return;

    const normalized = normalizeBarcode(data);
    if (!normalized) return;

    setScanned(true);
    setBarcode(normalized);

    const productData = await fetchProduct(normalized);

    if (isCancellingRef.current) return;

    setProduct(productData);

    await addScannedItem({
      barcode: normalized,
      name: productData?.name ?? "",
      thumbnailUri: productData?.image ?? "",
      source: "scanner",
    });

    if (itemId) {
      navigation.navigate("ItemDetail", {
        id: itemId,
        scannedBarcode: normalized,
        productName: productData?.name ?? "",
        productImage: productData?.image ?? "",
      });
    }
  }

  return (
    <Wrapper style={{ flex: 1, backgroundColor: "black" }}>
      <BarcodeScanner
        key={scannerKey}
        active
        statusMessage="Escanea un código de barras"
        statusColor="#2563eb"
        onStartScanning={() => {
          isCancellingRef.current = false;
          abortControllerRef.current?.abort();
          setBarcode("");
          setScanned(false);
          setProduct(null);
          setOpeningBrowser(false);
        }}
        onScanned={handleScanned}
        onCancel={handleCancel}
      />

      {scanned && barcode && !itemId ? (
        <BarcodeInfoCard
          barcode={barcode}
          product={product}
          openingBrowser={openingBrowser}
          onSearch={() => openBrowser(barcode)}
          onResume={() => {
            isCancellingRef.current = false;
            resetScanState();
          }}
          onCopy={() => copyBarcode(barcode)}
        />
      ) : null}
    </Wrapper>
  );
}
