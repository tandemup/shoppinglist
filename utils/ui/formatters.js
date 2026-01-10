import { formatCurrency } from "../store/formatters";

/* ---------------------------------
   Text formatters (SAFE)
---------------------------------- */

export function joinText(...parts) {
  return parts
    .filter((p) => p !== null && p !== undefined && p !== "")
    .map(String)
    .join("");
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
