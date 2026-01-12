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

export const normalizePriceInfo = (priceInfo = {}) => {
  const base = defaultPriceInfo();

  return {
    ...base,
    ...priceInfo,
    qty: Number(priceInfo.qty ?? base.qty),
    unitPrice: Number(priceInfo.unitPrice ?? base.unitPrice),
    total: Number(priceInfo.total ?? base.total),
    savings: Number(priceInfo.savings ?? 0),
  };
};
