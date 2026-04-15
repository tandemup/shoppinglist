import { normalizePromotion, validatePromotion } from "./PricingEngine";

function toNumber(value) {
  return Number(String(value).replace(",", "."));
}

function hasDecimals(value) {
  const n = toNumber(value);
  return !Number.isInteger(n);
}

export function validatePricing(pricing) {
  const errors = {};

  const qty = toNumber(pricing.qty);
  const price = toNumber(pricing.unitPrice);
  const unit = pricing.unit;
  const promoId = pricing.promo ?? "none";

  // 🧩 cantidad
  if (!qty || qty <= 0) {
    errors.qty = "La cantidad debe ser mayor que 0";
  }

  if (unit === "u" && hasDecimals(pricing.qty)) {
    errors.qty = "La unidad 'pieza' no admite decimales";
  }

  // 💰 precio
  if (price < 0) {
    errors.price = "El precio no puede ser negativo";
  }

  // 🎯 promoción
  const promo = normalizePromotion(promoId);
  const promoValidation = validatePromotion(promo, qty, price);

  if (!promoValidation.valid) {
    errors.promo = promoValidation.message || "Promoción no válida";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
