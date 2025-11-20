// screens/ProductLookup.js
import SEARCH_ENGINES from "../data/search_engines.json";

export const buildSearchUrl = (engineId, barcode) => {
  const engine = SEARCH_ENGINES.find((e) => e.id === engineId);
  return engine
    ? engine.baseUrl + barcode
    : `https://www.google.com/search?q=${barcode}`;
};

/**
 * Búsqueda optimizada:
 * - ISBN → OpenLibrary
 * - Productos → OpenFoodFacts
 * - Fallback → Google Shopping o motor definido en config
 */
export const fetchProductInfo = async (barcode, signal, config) => {
  try {
    // 📚 ISBN
    if (barcode.startsWith("978") || barcode.startsWith("979")) {
      const r = await fetch(`https://openlibrary.org/isbn/${barcode}.json`, {
        signal,
      });

      if (r.ok) {
        const d = await r.json();
        return {
          code: barcode,
          name: d.title || "Libro desconocido",
          brand: d.publishers?.join(", ") || "Editorial desconocida",
          image: d.covers
            ? `https://covers.openlibrary.org/b/id/${d.covers[0]}-M.jpg`
            : null,
          url: `https://openlibrary.org/isbn/${barcode}`,
        };
      }
    }

    // 🍎 Producto — motor primario
    if (config.lookup.primary === "openfoodfacts") {
      const r = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { signal }
      );

      const data = await r.json();

      if (data.status === 1) {
        const p = data.product;

        return {
          code: barcode,
          name: p.product_name || "Producto desconocido",
          brand: p.brands || "Sin marca",
          image: p.image_small_url,
          url: p.url,
        };
      }
    }

    // 🔁 Fallback automático
    return {
      code: barcode,
      name: "Producto no encontrado",
      brand: "",
      image: null,
      url: buildSearchUrl(config.lookup.fallback, barcode),
    };
  } catch (err) {
    // Cancelación manual
    if (err.name === "AbortError") {
      return null;
    }
    return null;
  }
};
