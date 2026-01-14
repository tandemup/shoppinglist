/* {
    "qty": 3,
    "unit": "u",
    "unitPrice": 2,
    "currency": "€",
    "promo": "3x2",
    "promoLabel": "3x2",
    "subtotal": 6,
    "total": 4,
    "savings": 2,
    "summary": "3 u × 2.00 €/u\n→ 4.00 €",
    "warning": null
}

  {
    "qty": 3,
    "unit": "u",
    "unitPrice": 2,
    "currency": "€",
    "promo": "3x2",
    "promoLabel": "3x2",
    "subtotal": 6,
    "total": 4,
    "savings": 2,
    "summary": "3 u × 2.00 €/u\n→ 4.00 €",
    "warning": null
}

  const pi = item.priceInfo || {};
  pi.currency
  pi.promo
  pi.promoLabel
  pi.qty,
  pi.savings
  pi.subtotal
  pi.summary
  pi.total,
  pi.unit,
  pi.unitPrice,
  pi.warning,
  
  const quantity = Number(pi.qty ?? item.quantity ?? 1);
  const unit = pi.unit ?? "";
  const unitPrice = Number(pi.unitPrice ?? 0);
  const total = Number(pi.total ?? 0);
  const savings = Number(pi.savings ?? 0);
  const promo = pi.promoLabel || pi.promo;

  */

const defaultPriceInfo_OLD = () => ({
  unitType: "u", // u | kg | l
  qty: 1,
  unitPrice: 0,
  promo: "none",
  total: 0,
  summary: "",
  warning: null,
});

export const defaultPriceInfo = () => ({
  currency: "€",
  promo: "",
  promoLabel: "",
  qty: 1,
  savings: 0,
  subtotal: 0,
  summary: 0,
  total: 0,
  unit: "u",
  unitPrice: 0,
});

export const defaultItem = {
  id: "",
  name: "",
  brand: "",
  barcode: "",
  image: null,
  checked: true,
  priceInfo: defaultPriceInfo(),
};
const normalizePromoText = (value) => {
  if (typeof value !== "string") return "";
  const v = value.trim().toLowerCase();
  if (!v || v === "none") return "";
  return value;
};

export const normalizePriceInfo = (priceInfo) => {
  const base = defaultPriceInfo();

  // 🔒 Protección absoluta
  if (!priceInfo || typeof priceInfo !== "object") {
    return base;
  }

  return {
    ...base,
    ...priceInfo,

    // Normalización defensiva
    qty: Number(priceInfo.qty ?? base.qty),
    unit: priceInfo.unit ?? base.unit,
    unitPrice: Number(priceInfo.unitPrice ?? base.unitPrice),
    subtotal: Number(priceInfo.subtotal ?? base.subtotal),
    total: Number(priceInfo.total ?? base.total),
    savings: Number(priceInfo.savings ?? 0),
    promo: normalizePromoText(priceInfo.promo),
    promoLabel: normalizePromoText(priceInfo.promoLabel),

    summary: priceInfo.summary ?? base.summary,
    warning: priceInfo.warning ?? null,
  };
};
