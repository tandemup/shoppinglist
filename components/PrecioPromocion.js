import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { parseReal, normalizeReal } from '../utils/number.js';
import { PROMOTIONS, calcularPromoTotal } from '../utils/promoCalculator.js';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UNIT_TYPES = ['u', 'kg', 'l'];

export default function PrecioPromocion({ value = {}, onChange }) {
  const [localPrice, setLocalPrice] = useState(String(value.unitPrice ?? ''));
  const [localQty, setLocalQty] = useState(String(value.qty ?? '1'));
  const [localPromo, setLocalPromo] = useState(value.promo ?? 'none');
  const [localUnit, setLocalUnit] = useState(value.unitType ?? 'u');
  const [expanded, setExpanded] = useState(false);

  const lastSent = useRef(null);

  const getTotals = () => {
    const p = parseReal(localPrice);
    const q = parseReal(localQty);
    if (isNaN(p) || isNaN(q)) return { total: 0, summary: '', warning: null };

    const { total, warning, label } = calcularPromoTotal(localPromo, p, q);
    const promoLabel = localPromo !== 'none' ? ` (${label})` : '';
    const summary = `${q} × ${p.toFixed(2)} €${promoLabel} = ${total.toFixed(
      2
    )} €`;

    return { total, summary, warning, label };
  };

  const { total, summary, warning, label } = getTotals();

  // 📤 Enviar cambios al padre
  useEffect(() => {
    const p = parseReal(localPrice);
    const q = parseReal(localQty);
    if (isNaN(p) || isNaN(q)) return;

    const newValue = {
      unitPrice: Number(p.toFixed(2)),
      qty: Number(q),
      promo: localPromo,
      unitType: localUnit,
      total: Number(total.toFixed(2)),
      summary,
    };

    const prevValue = lastSent.current;
    if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
      lastSent.current = newValue;
      onChange(newValue);
    }
  }, [localPrice, localQty, localPromo, localUnit, total]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* ☑️ Selector de unidad */}
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.label}>Unidad</Text>
        <View style={styles.selectorRow}>
          {UNIT_TYPES.map((u) => {
            const emoji = u === 'kg' ? '⚖️' : u === 'l' ? '🧃' : '🧩';
            return (
              <Pressable
                key={u}
                style={[
                  styles.selectorBtn,
                  localUnit === u && styles.selectorBtnActive,
                ]}
                onPress={() => setLocalUnit(u)}>
                <Text
                  style={[
                    styles.selectorText,
                    localUnit === u && styles.selectorTextActive,
                  ]}>
                  {emoji} {u}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.unitHint}>
          🧩 = unidad ⚖️ = kilogramo 🧃 = litro
        </Text>
      </View>

      {/* 💰 Cantidad y Precio */}
      <View style={styles.row}>
        <View style={styles.halfBox}>
          <Text style={styles.label}>
            Cantidad ({localUnit === 'u' ? 'u' : localUnit})
          </Text>
          <TextInput
            style={[styles.input, styles.bigInput]}
            keyboardType="decimal-pad"
            value={localQty}
            onChangeText={(text) => setLocalQty(normalizeReal(text))}
            onBlur={() => {
              const val = parseReal(localQty);
              if (!isNaN(val)) setLocalQty(val.toString());
            }}
            placeholder="0"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={[styles.halfBox, { marginLeft: 10 }]}>
          <Text style={styles.label}>Precio unitario (€/{localUnit})</Text>
          <TextInput
            style={[styles.input, styles.bigInput]}
            keyboardType="decimal-pad"
            value={localPrice}
            onChangeText={(text) => setLocalPrice(normalizeReal(text))}
            onBlur={() => {
              const val = parseReal(localPrice);
              if (!isNaN(val)) setLocalPrice(val.toFixed(2));
            }}
            placeholder="0.00"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* 🎁 Ofertas (colapsable) */}
      <Pressable onPress={toggleExpanded} style={styles.offerHeader}>
        <Text style={styles.sectionTitle}>🎁 Ofertas</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {!expanded && localPromo !== 'none' && (
        <Text style={styles.activePromoText}>
          Oferta seleccionada: {PROMOTIONS[localPromo]?.label}
        </Text>
      )}

      {expanded && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.sectionHint}>
            Selecciona una promoción si aplica a la cantidad comprada:
          </Text>

          <View style={styles.selectorRow}>
            {Object.entries(PROMOTIONS).map(([key, promo]) => {
              const isActive = localPromo === key;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.selectorBtn,
                    isActive && styles.selectorBtnActive,
                  ]}
                  onPress={() => setLocalPromo(key)}>
                  <Text
                    style={[
                      styles.selectorText,
                      isActive && styles.selectorTextActive,
                    ]}>
                    {promo.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  halfBox: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
    marginBottom: 6,
  },
  bigInput: {
    fontSize: 18,
    textAlign: 'left',
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  selectorBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  selectorBtnActive: { backgroundColor: '#2563EB' },
  selectorText: { color: '#475569', fontWeight: '600' },
  selectorTextActive: { color: 'white' },
  unitHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  offerHeader: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  chevron: {
    fontSize: 14,
    color: '#64748b',
  },
  sectionHint: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  activePromoText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    marginTop: 2,
  },
  totalBox1: {
    marginTop: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  totalBox: {
    marginTop: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 1,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
  totalDetail: { marginTop: 4, fontSize: 13, color: '#555' },
  totalWarning: {
    marginTop: 6,
    fontSize: 13,
    color: '#b91c1c',
    fontWeight: '500',
  },
});
