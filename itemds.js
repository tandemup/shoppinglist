// ItemDetailScreen.js — versión con total en tiempo real + decimales seguros

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  ScrollView,
} from "react-native";

import EditName from "../components/EditName";
import EditBarcode from "../components/EditBarcode";
import UnidadSelector from "../components/UnidadSelector";
import CantidadPrecioInputs from "../components/CantidadPrecioInputs";
import OfertaSelector from "../components/OfertaSelector";
import TotalBox from "../components/TotalBox";
import { calcularPromoTotal } from "../utils/pricing/PricingEngine";

import { ItemFactory } from "../utils/ItemFactory";
import { normalizeReal, parseReal } from "../utils/number";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// -------------------------------------------------------------
// CALCULAR PRICEINFO FINAL (solo en blur / guardar)
// -------------------------------------------------------------
function calculatePriceInfo(priceInfo = {}) {
  const qty = Number(priceInfo.qty) || 1;
  const unitPrice = Number(priceInfo.unitPrice) || 0;
  const promoKey = priceInfo.promo ?? "none";

  const result = calcularPromoTotal(promoKey, unitPrice, qty);

  return {
    ...priceInfo,
    qty,
    unitPrice,
    total: result.total,
    summary: result.label,
    warning: result.warning,
  };
}

// -------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------------
export default function ItemDetailScreen({ route, navigation }) {
  const { item, listId, onSave, onDelete } = route.params;

  //
  // 1️⃣ Clonar el item para obtener datos coherentes sin mutar el original
  //
  const base = ItemFactory.clone(item);

  //
  // 2️⃣ Estado local ÚNICO: itemData
  //
  const [itemData, setItemData] = useState(base);

  // Expansión de promociones
  const [expanded, setExpanded] = useState(false);

  // -------------------------------------------------------------
  // ACTUALIZAR PRICEINFO SOLO EN BLUR
  // -------------------------------------------------------------
  const updatePriceField = (patch) => {
    setItemData((prev) => {
      const updatedPriceInfo = calculatePriceInfo({
        ...prev.priceInfo,
        ...patch,
      });

      return {
        ...prev,
        priceInfo: updatedPriceInfo,
        priceInfoRaw: {}, // limpieza opcional
      };
    });
  };

  // -------------------------------------------------------------
  // ► TOTAL EN TIEMPO REAL (sin tocar priceInfo todavía)
  // -------------------------------------------------------------
  const qtyPreview = parseReal(
    itemData.priceInfo.qtyRaw ?? itemData.priceInfo.qty,
    1
  );
  const unitPricePreview = parseReal(
    itemData.priceInfo.unitPriceRaw ?? itemData.priceInfo.unitPrice,
    0
  );
  const promoKey = itemData.priceInfo.promo ?? "none";

  const resultPreview = calcularPromoTotal(
    promoKey,
    unitPricePreview,
    qtyPreview
  );

  // Subtotal y ahorro (preview)
  const totalPreview = resultPreview.total;

  const subtotalPreview = qtyPreview * unitPricePreview;
  const savingsPreview = Math.max(0, subtotalPreview - totalPreview);

  const summaryPreview = resultPreview.label;
  const warningPreview = resultPreview.warning;

  // -------------------------------------------------------------
  // GUARDAR → solo PATCH
  // -------------------------------------------------------------
  const handleSave = () => {
    const { name, barcode, priceInfo } = itemData;

    // 🔥 Total calculado con la oferta aplicada (ya lo tienes arriba como totalPreview)
    const finalTotal = totalPreview;

    const patch = {
      name: (name ?? "").trim(),
      barcode: barcode ?? null,
      priceInfo: {
        qty: Number(priceInfo.qty) || 1,
        unitPrice: Number(priceInfo.unitPrice) || 0,
        unitType: priceInfo.unitType,
        promo: priceInfo.promo,
        total: finalTotal, // 👈🔥 CLAVE: ahora sí se guarda la oferta
        summary: summaryPreview, // opcional pero recomendado
        warning: warningPreview, // opcional
      },
    };

    onSave(patch);
    navigation.goBack();
  };

  //
  // Eliminar item
  //
  const handleDelete = () => {
    onDelete(item.id);
    navigation.goBack();
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* NOMBRE */}
      <EditName
        style={{ marginTop: 0 }}
        name={itemData.name}
        setName={(text) =>
          setItemData((prev) => ({
            ...prev,
            name: text,
          }))
        }
      />

      {/* BARCODE */}
      <EditBarcode
        style={{ marginTop: 0 }}
        barcode={itemData.barcode}
        setBarcode={(text) =>
          setItemData((prev) => ({
            ...prev,
            barcode: text,
          }))
        }
      />

      {/* UNIDAD */}
      <UnidadSelector
        unitType={itemData.priceInfo.unitType}
        onChange={(unitType) =>
          updatePriceField({
            unitType,
          })
        }
      />

      {/* CANTIDAD + PRECIO UNITARIO */}
      <CantidadPrecioInputs
        unitType={itemData.priceInfo.unitType}
        qty={String(itemData.priceInfo.qtyRaw ?? itemData.priceInfo.qty)}
        unitPrice={String(
          itemData.priceInfo.unitPriceRaw ?? itemData.priceInfo.unitPrice
        )}
        onQtyChange={(t) =>
          setItemData((prev) => ({
            ...prev,
            priceInfo: {
              ...prev.priceInfo,
              qtyRaw: normalizeReal(t),
            },
          }))
        }
        onUnitPriceChange={(t) =>
          setItemData((prev) => ({
            ...prev,
            priceInfo: {
              ...prev.priceInfo,
              unitPriceRaw: normalizeReal(t),
            },
          }))
        }
        onQtyBlur={() =>
          updatePriceField({
            qty: parseReal(itemData.priceInfo.qtyRaw, 1),
          })
        }
        onUnitPriceBlur={() =>
          updatePriceField({
            unitPrice: parseReal(itemData.priceInfo.unitPriceRaw, 0),
          })
        }
      />

      {/* PROMOCIONES */}
      <OfertaSelector
        expanded={expanded}
        promo={itemData.priceInfo.promo}
        onToggle={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded((v) => !v);
        }}
        onSelect={(promo) => {
          updatePriceField({ promo });
        }}
      />

      {/* TOTAL (siempre en tiempo real) */}
      <TotalBox
        qty={qtyPreview}
        unit={itemData.priceInfo.unit}
        unitPrice={unitPricePreview}
        subtotal={subtotalPreview}
        promo={promoKey}
        savings={savingsPreview}
        total={totalPreview}
        currency="€"
        warning={warningPreview}
      />

      {/* BOTONES */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>💾 Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// ESTILOS — optimizados
// -------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  container1: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 12,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  actions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
