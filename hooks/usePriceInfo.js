// hooks/usePriceInfo.js — versión optimizada

import { useStore } from "../context/StoreContext";
import { parseReal, normalizeReal } from "../utils/number";
import { calcularPromoTotal } from "../utils/pricing/PricingEngine";

export function usePriceInfo({ listId, itemId }) {
  const { getItemById, updateItem } = useStore();

  const item = getItemById(listId, itemId);
  const priceInfo = item?.priceInfo ?? {};

  const update = (patch) => {
    const merged = { ...priceInfo, ...patch };

    const unitPrice = parseReal(merged.unitPrice);
    const qty = parseReal(merged.qty);

    const { total, warning, label } = calcularPromoTotal(
      merged.promo ?? "none",
      unitPrice,
      qty
    );

    const promoLabel = merged.promo !== "none" ? ` (${label})` : "";

    const summary = `${qty} × ${unitPrice.toFixed(
      2
    )} €${promoLabel} = ${total.toFixed(2)} €`;

    updateItem(listId, itemId, {
      priceInfo: {
        ...merged,
        qty,
        unitPrice,
        total,
        summary,
        warning,
      },
    });
  };

  return { priceInfo, update };
}
