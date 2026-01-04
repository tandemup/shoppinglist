import { getOpenStatus, getOpeningText } from "./openingHours";

/**
 * Formatea el nombre de la tienda
 */
export const formatStoreName = (store) => {
  return store?.name ?? "";
};

/**
 * Formatea dirección completa
 */
export const formatStoreAddress = (store) => {
  if (!store) return "";
  return [store.address, store.city].filter(Boolean).join(", ");
};

/**
 * Devuelve "Abierto" / "Cerrado"
 */
export const formatStoreOpenLabel = (store, date = new Date()) => {
  if (!store?.hours) return "Horario no disponible";

  const status = getOpenStatus(store.hours, date);
  return status === "open" ? "Abierto" : "Cerrado";
};

/**
 * Devuelve texto tipo:
 * "Abierto · Cierra a las 21:00"
 * "Abre a las 09:00"
 */
export const formatStoreOpeningText = (store, date = new Date()) => {
  if (!store?.hours) return "Horario no disponible";

  return getOpeningText(store.hours, date);
};

/**
 * Distancia formateada
 */
export const formatStoreDistance = (distanceKm) => {
  if (distanceKm == null) return "";
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Badge para UI
 */
export const getStoreStatusBadge = (store, date = new Date()) => {
  if (!store?.hours) {
    return { label: "Horario ?", color: "#999" };
  }

  const status = getOpenStatus(store.hours, date);

  return status === "open"
    ? { label: "Abierto", color: "#2ecc71" }
    : { label: "Cerrado", color: "#e74c3c" };
};

/**
 * Formatea una tienda de forma segura para UI genérica
 * (listas, selects, fallback defensivo)
 */
export const formatStoreLabel = (store) => {
  if (!store) return "";

  // Si ya es string → usar tal cual
  if (typeof store === "string") return store;

  // Evitar objetos no imprimibles (mapas, overlays, etc.)
  if (
    store.icon !== undefined ||
    store.zone !== undefined ||
    store.radius !== undefined ||
    store.color !== undefined
  ) {
    return "";
  }

  // Nombre estándar
  if (typeof store.name === "string") return store.name;

  return "";
};

export function formatCurrency(value, currency = "EUR", locale = "es-ES") {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
