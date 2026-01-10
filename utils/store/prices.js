import { joinText } from "./text";

export function formatCurrency(value, currency = "EUR", locale = "es-ES") {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function priceText(price, unit) {
  if (price == null) return "";
  return joinText(formatCurrency(price), unit && ` / ${unit}`);
}

export function metaText(frequency, date) {
  if (!frequency && !date) return "";

  const d = date ? new Date(date).toLocaleDateString("es-ES") : "—";
  return joinText(`${frequency} compras`, " · ", d);
}
