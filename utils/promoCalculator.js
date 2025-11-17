// utils/promoCalculator.js
// 📦 Define todas las promociones disponibles y cómo calcular sus efectos.

export const PROMOTIONS = {
  none: {
    label: "none",
    // ✅ Siempre aplicable
    isApplicable: () => true,
    // 🔹 No altera el precio
    apply: (price, qty) => price * qty,
  },

  "2x1": {
    label: "2x1",
    isApplicable: (qty) => qty >= 2,
    apply: (price, qty) => {
      const pairs = Math.floor(qty / 2);
      const remainder = qty % 2;
      return (pairs + remainder) * price;
    },
  },

  "3x2": {
    label: "3x2",
    isApplicable: (qty) => qty >= 3,
    apply: (price, qty) => {
      const sets = Math.floor(qty / 3);
      const remainder = qty % 3;
      return (sets * 2 + remainder) * price;
    },
  },

  discount10: {
    label: "10% descuento",
    isApplicable: () => true,
    apply: (price, qty) => price * qty * 0.9,
  },

  discount20: {
    label: "20% descuento",
    isApplicable: () => true,
    apply: (price, qty) => price * qty * 0.8,
  },
};

// 🧮 Calcula el total aplicando la promoción seleccionada
export function calcularPromoTotal(promoKey, price, qty) {
  const promo = PROMOTIONS[promoKey] || PROMOTIONS.none;

  if (isNaN(price) || isNaN(qty)) {
    return { total: 0, warning: "Valores inválidos", label: promo.label };
  }

  const isValid = promo.isApplicable(qty);
  const total = promo.apply(price, qty);

  let warning = null;
  if (!isValid && promoKey !== "none") {
    warning = `Esta oferta no aplica a la cantidad (${qty}) seleccionada.`;
  }

  return { total, warning, label: promo.label };
}
