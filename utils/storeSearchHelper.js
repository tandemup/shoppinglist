// helpers/storeSearchHelper.js

/**
 * Normaliza texto para búsquedas:
 * - minúsculas
 * - sin acentos
 */
export const normalizeText = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/**
 * Devuelve true si una tienda coincide con el texto de búsqueda
 */
export const storeMatchesSearch = (store, search) => {
  if (!search?.trim()) return true;
  if (!store) return false;

  const haystack = normalizeText(
    [
      store.name,
      store.address,
      store.city,
      store.postalCode,
      store.location?.address,
      store.location?.city,
      store.location?.postcode,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return haystack.includes(normalizeText(search));
};

/**
 * Filtra una lista de tiendas por búsqueda textual
 */
export const filterStoresBySearch = (stores = [], search = "") => {
  if (!Array.isArray(stores)) return [];
  if (!search?.trim()) return stores;

  return stores.filter((store) => storeMatchesSearch(store, search));
};
