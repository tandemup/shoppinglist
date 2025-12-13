// utils/ItemFactory.js
import { generateId } from "./generateId";
import { defaultItem, defaultPriceInfo } from "./defaultItem";
import { PricingEngine } from "./pricing";

// -------------------------------------
function safeNumber(n, fallback = 0) {
  const num = Number(n);
  return isFinite(num) ? num : fallback;
}

// -------------------------------------
// NORMALIZE PRICEINFO
// -------------------------------------
export function normalizePriceInfo(priceInfo = {}) {
  const base = defaultPriceInfo();

  const qty = safeNumber(priceInfo.qty ?? base.qty, 1);
  const unit = priceInfo.unit ?? base.unit;
  const unitPrice = safeNumber(priceInfo.unitPrice ?? base.unitPrice, 0);
  const currency = priceInfo.currency ?? base.currency;
  const promo = priceInfo.promo ?? base.promo ?? null;

  const pricing = PricingEngine.calculate({
    qty,
    unit,
    unitPrice,
    currency,
    promo,
  });

  return {
    ...base,
    ...priceInfo,

    qty,
    unit,
    unitPrice,
    currency,
    promo,

    subtotal: pricing.subtotal,
    total: pricing.total,
    savings: pricing.savings,

    promoLabel: pricing.promoLabel ?? null,
    summary: pricing.summary ?? null,
    warning: pricing.warning ?? null,
  };
}
// -------------------------------------
// FACTORY
// -------------------------------------
export class ItemFactory {
  static create(name = "") {
    return {
      ...defaultItem,
      id: generateId(),
      name,
      checked: true,
      priceInfo: normalizePriceInfo({}),
    };
  }

  static normalize(item) {
    if (!item) return null;

    return {
      ...defaultItem,
      ...item,

      id: item.id ?? generateId(),
      name: item.name?.trim() ?? "",

      checked:
        typeof item.checked === "boolean" ? item.checked : defaultItem.checked,

      priceInfo: normalizePriceInfo(item.priceInfo),
    };
  }

  static clone(item) {
    return ItemFactory.normalize(JSON.parse(JSON.stringify(item)));
  }

  static applyPatch(baseItem, patch) {
    const merged = {
      ...baseItem,
      ...patch,
      priceInfo: normalizePriceInfo({
        ...(baseItem.priceInfo ?? {}),
        ...(patch.priceInfo ?? {}),
      }),
    };

    return ItemFactory.normalize(merged);
  }
}
