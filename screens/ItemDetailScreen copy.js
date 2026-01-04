import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  PricingEngine,
  PROMOTIONS,
  NO_PROMO,
} from "../utils/pricing/PricingEngine";
import { formatUnit } from "../utils/pricing/unitFormat";

import { safeAlert } from "../utils/core/safeAlert";

export default function ItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, onSave, onDelete } = route.params;

  // ────────────────────────────────────────────────
  // ESTADO (⚠️ qty y unitPrice como STRING)
  // ────────────────────────────────────────────────
  const [name, setName] = useState(item.name ?? "");
  const [barcode, setBarcode] = useState(item.barcode ?? "");

  const [qty, setQty] = useState(String(item.priceInfo?.qty ?? "1"));
  const [unitPrice, setUnitPrice] = useState(
    String(item.priceInfo?.unitPrice ?? "0")
  );

  const [unit, setUnit] = useState(item.priceInfo?.unit ?? "u");
  const [promo, setPromo] = useState(item.priceInfo?.promo ?? "none");

  // ────────────────────────────────────────────────
  // CÁLCULO CENTRAL (aquí sí convertimos a number)
  // ────────────────────────────────────────────────
  const priceInfo = useMemo(() => {
    return PricingEngine.calculate({
      qty: Number(qty.replace(",", ".")) || 0,
      unit,
      unitPrice: Number(unitPrice.replace(",", ".")) || 0,
      promo,
      currency: "€",
    });
  }, [qty, unit, unitPrice, promo]);

  // ────────────────────────────────────────────────
  useEffect(() => {
    navigation.setOptions({ title: "Editar producto" });
  }, [navigation]);

  // ────────────────────────────────────────────────
  const handleSave = () => {
    if (!name.trim()) {
      safeAlert("Nombre vacío", "El producto debe tener un nombre");
      return;
    }

    onSave({
      ...item,
      name: name.trim(),
      barcode: barcode.trim(),
      checked: item.checked ?? true,
      priceInfo,
    });

    navigation.goBack();
  };

  const handleDelete = () => {
    safeAlert(
      "Eliminar producto",
      `¿Seguro que quieres eliminar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await onDelete(item.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  // ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* NOMBRE */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        {/* CÓDIGO DE BARRAS */}
        <Text style={styles.label}>Código de barras</Text>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
        />

        {/* UNIDAD */}
        <Text style={styles.label}>Unidad</Text>
        <View style={styles.unitRow}>
          {["u", "kg", "g", "l"].map((u) => (
            <Pressable
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}
            >
              <Text
                style={[styles.unitText, unit === u && styles.unitTextActive]}
              >
                {formatUnit(u)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* CANTIDAD + PRECIO EN MISMA FILA */}
        <View style={styles.inlineRow}>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Cantidad ({formatUnit(unit)})</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={qty}
              onChangeText={setQty}
            />
          </View>

          <View style={styles.inlineField}>
            <Text style={styles.label}>€/u</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={unitPrice}
              onChangeText={setUnitPrice}
            />
          </View>
        </View>

        {/* PROMOCIONES */}
        <Text style={styles.label}>Ofertas</Text>
        <View style={styles.promoRow}>
          {Object.entries(PROMOTIONS).map(([key, p]) => (
            <Pressable
              key={key}
              style={[styles.promoBtn, promo === key && styles.promoBtnActive]}
              onPress={() => setPromo(key)}
            >
              <Text
                style={[
                  styles.promoText,
                  promo === key && styles.promoTextActive,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* RESUMEN */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Total</Text>
          <Text style={styles.summaryValue}>
            {priceInfo.total.toFixed(2)} €
          </Text>
          {priceInfo.savings > 0 && (
            <Text style={styles.savings}>
              Ahorro: {priceInfo.savings.toFixed(2)} €
            </Text>
          )}
        </View>

        {/* ACCIONES */}
        <View style={styles.actions}>
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save" size={18} color="#fff" />
            <Text style={styles.saveText}>Guardar</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ────────────────────────────────────────────────
// ESTILOS (solo añadimos inlineRow)
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },
  unitRow: { flexDirection: "row", gap: 8 },
  unitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  unitBtnActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  unitText: { color: "#111", fontWeight: "500" },
  unitTextActive: { color: "#fff" },

  inlineRow: {
    flexDirection: "row",
    gap: 12,
  },
  inlineField: {
    flex: 1,
  },

  promoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  promoBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  promoBtnActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  promoText: { fontSize: 13, color: "#111" },
  promoTextActive: { color: "#fff", fontWeight: "600" },

  summary: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  summaryTitle: { fontSize: 14, color: "#555" },
  summaryValue: { fontSize: 22, fontWeight: "700", marginTop: 4 },
  savings: { marginTop: 4, color: "#15803d", fontWeight: "600" },

  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "600" },
});
