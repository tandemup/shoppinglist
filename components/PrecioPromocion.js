// components/PrecioPromocion.js

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { parseReal, normalizeReal } from "../utils/number.js";
import { PROMOTIONS, calcularPromoTotal } from "../utils/promoCalculator.js";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UNIT_TYPES = ["u", "kg", "l"];

export default function PrecioPromocion({ value = {}, onChange }) {
  const [localUnit, setLocalUnit] = useState(value.unitType ?? "u");
  const [localQty, setLocalQty] = useState(String(value.qty ?? "1"));
  const [localPrice, setLocalPrice] = useState(String(value.unitPrice ?? ""));
  const [localPromo, setLocalPromo] = useState(value.promo ?? "none");
  const [expanded, setExpanded] = useState(false);

  const lastSent = useRef(null);

  const computeTotals = () => {
    const p = parseReal(localPrice);
    const q = parseReal(localQty);

    if (isNaN(p) || isNaN(q)) return { total: 0, summary: "", warning: null };

    const { total, warning, label } = calcularPromoTotal(localPromo, p, q);
    const promoLabel = localPromo !== "none" ? ` (${label})` : "";
    const summary = `${q} × ${p.toFixed(2)} €${promoLabel} = ${total.toFixed(
      2
    )} €`;

    return { total, summary, warning };
  };

  const { total, summary, warning } = computeTotals();

  // -----------------------------
  // Propagar cambios al padre
  // -----------------------------
  useEffect(() => {
    const p = parseReal(localPrice);
    const q = parseReal(localQty);

    if (isNaN(p) || isNaN(q)) return;

    const newValue = {
      unitType: localUnit,
      unitPrice: Number(p.toFixed(2)),
      qty: Number(q),
      promo: localPromo,
      total: Number(total.toFixed(2)),
      summary,
    };

    if (JSON.stringify(lastSent.current) !== JSON.stringify(newValue)) {
      lastSent.current = newValue;
      onChange(newValue);
    }
  }, [localUnit, localQty, localPrice, localPromo, total]);

  return (
    <View style={styles.container}>
      {/* UNIDAD */}
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Unidad</Text>

        <View style={styles.selectorRow}>
          {UNIT_TYPES.map((u) => {
            const emoji = u === "kg" ? "⚖️" : u === "l" ? "🧃" : "🧩";
            const active = localUnit === u;

            return (
              <Pressable
                key={u}
                style={[styles.selectorBtn, active && styles.selectorBtnActive]}
                onPress={() => setLocalUnit(u)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    active && styles.selectorTextActive,
                  ]}
                >
                  {emoji} {u}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.unitHint}>🧩 unidad ⚖️ kilo 🧃 litro</Text>
      </View>

      {/* CANTIDAD & PRECIO */}
      <View style={styles.row}>
        <View style={styles.halfBox}>
          <Text style={styles.label}>Cantidad ({localUnit})</Text>

          <TextInput
            style={[styles.input, styles.bigInput]}
            keyboardType="decimal-pad"
            value={localQty}
            onChangeText={(t) => setLocalQty(normalizeReal(t))}
            onBlur={() => {
              const val = parseReal(localQty);
              if (!isNaN(val)) setLocalQty(val.toString());
            }}
            placeholder="0"
          />
        </View>

        <View style={[styles.halfBox, { marginLeft: 10 }]}>
          <Text style={styles.label}>Precio unitario (€/{localUnit})</Text>
          <TextInput
            style={[styles.input, styles.bigInput]}
            keyboardType="decimal-pad"
            value={localPrice}
            onChangeText={(t) => setLocalPrice(normalizeReal(t))}
            onBlur={() => {
              const val = parseReal(localPrice);
              if (!isNaN(val)) setLocalPrice(val.toFixed(2));
            }}
            placeholder="0.00"
          />
        </View>
      </View>

      {/* OFERTAS */}
      <Pressable
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((prev) => !prev);
        }}
        style={styles.offerHeader}
      >
        <Text style={styles.sectionTitle}>🎁 Ofertas</Text>
        <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>

      {!expanded && localPromo !== "none" && (
        <Text style={styles.activePromoText}>
          Oferta seleccionada: {PROMOTIONS[localPromo]?.label}
        </Text>
      )}

      {expanded && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionHint}>Selecciona una promoción:</Text>

          <View style={styles.selectorRow}>
            {Object.entries(PROMOTIONS).map(([key, promo]) => {
              const active = localPromo === key;

              return (
                <Pressable
                  key={key}
                  style={[
                    styles.selectorBtn,
                    active && styles.selectorBtnActive,
                  ]}
                  onPress={() => setLocalPromo(key)}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      active && styles.selectorTextActive,
                    ]}
                  >
                    {promo.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* TOTAL */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total: {total.toFixed(2)} €</Text>
        {summary ? <Text style={styles.totalDetail}>{summary}</Text> : null}
        {warning && <Text style={styles.totalWarning}>⚠️ {warning}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfBox: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    backgroundColor: "white",
  },
  bigInput: { fontSize: 18 },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  selectorBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  selectorBtnActive: { backgroundColor: "#2563EB" },
  selectorText: { color: "#475569", fontWeight: "600" },
  selectorTextActive: { color: "#fff" },
  unitHint: { fontSize: 12, textAlign: "center", marginTop: 4 },
  offerHeader: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  chevron: { fontSize: 14 },
  activePromoText: { fontSize: 13, marginTop: 2, marginBottom: 6 },
  sectionHint: { fontSize: 13, marginBottom: 8 },
  totalBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalDetail: { marginTop: 4, fontSize: 13 },
  totalWarning: { marginTop: 6, color: "#b91c1c", fontSize: 13 },
});
