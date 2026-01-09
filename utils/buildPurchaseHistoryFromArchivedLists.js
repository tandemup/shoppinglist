import { normalizeProductName } from "./normalizeProductName";

/**
 * Construye el índice purchaseHistory a partir de las listas archivadas.
 * @param {Array} archivedLists
 * @returns {Array} purchaseHistory
 */
export function buildPurchaseHistoryFromArchivedLists(archivedLists = []) {
  const map = new Map();

  for (const list of archivedLists) {
    const storeId = list.storeId ?? null;
    const purchasedAt = list.archivedAt ?? list.date ?? Date.now();

    for (const item of list.items || []) {
      if (!item?.name) continue;

      const normalizedName = normalizeProductName(item.name);
      const barcode = item.barcode ?? null;

      // clave estable:
      // - si hay barcode → manda el barcode
      // - si no → nombre normalizado
      const key = barcode || normalizedName;

      const prev = map.get(key);

      if (!prev) {
        map.set(key, {
          id: key,
          name: item.name,
          normalizedName,
          barcode,

          storeId,
          lastPrice: item.unitPrice ?? null,
          unit: item.unit ?? "u",

          frequency: 1,
          lastPurchasedAt: purchasedAt,
        });
      } else {
        map.set(key, {
          ...prev,
          // conservar el nombre más reciente (por si cambia formato)
          name: item.name,

          // si antes no había barcode y ahora sí → aprenderlo
          barcode: prev.barcode ?? barcode,

          // última tienda / precio / unidad
          storeId,
          lastPrice: item.unitPrice ?? prev.lastPrice,
          unit: item.unit ?? prev.unit,

          frequency: prev.frequency + 1,
          lastPurchasedAt: Math.max(prev.lastPurchasedAt, purchasedAt),
        });
      }
    }
  }

  return Array.from(map.values());
}
