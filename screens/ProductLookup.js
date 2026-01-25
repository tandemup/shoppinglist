// screens/ProductLookup.js
// Helper para búsquedas de productos y libros por código de barras.
export const SEARCH_ENGINES = [
  {
    id: "openfoodfacts",
    name: "Open Food Facts",
    baseUrl: "https://world.openfoodfacts.org/product/",
  },
  {
    id: "google",
    name: "Google (Web)",
    baseUrl: "https://www.google.com/search?q=",
  },
  {
    id: "googleshopping",
    name: "Google Shopping",
    baseUrl: "https://www.google.com/search?tbm=shop&q=",
  },
  {
    id: "amazon",
    name: "Amazon",
    baseUrl: "https://www.amazon.es/s?k=",
  },
  {
    id: "carrefour",
    name: "Carrefour",
    baseUrl: "https://www.carrefour.es/?q=",
  },
  {
    id: "googlebooks",
    name: "Google Books",
    baseUrl: "https://www.google.com/search?tbm=bks&q=isbn:",
  },
  {
    id: "openlibrary",
    name: "Open Library",
    baseUrl: "https://openlibrary.org/isbn/",
  },
];

export const buildSearchUrl = (engineId, barcode) => {
  const engine = SEARCH_ENGINES.find((e) => e.id === engineId);
  if (!engine) return `https://www.google.com/search?q=${barcode}`;
  return `${engine.baseUrl}${barcode}`;
};

/**
 * Consulta Open Food Facts o OpenLibrary según el tipo de código.
 * - Si el código comienza por 978 o 979, se interpreta como ISBN de libro.
 * - En otro caso, se busca en Open Food Facts.
 */
export const fetchProductInfo = async (barcode) => {
  try {
    // 📘 Detectar ISBN
    if (barcode.startsWith("978") || barcode.startsWith("979")) {
      const bookResponse = await fetch(
        `https://openlibrary.org/isbn/${barcode}.json`,
      );
      if (bookResponse.ok) {
        const book = await bookResponse.json();
        return {
          code: barcode,
          name: book.title || "Libro desconocido",
          brand: book.publishers
            ? book.publishers.join(", ")
            : "Editorial desconocida",
          image: book.covers
            ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
            : null,
          url: `https://openlibrary.org/isbn/${barcode}`,
          date: new Date().toISOString(),
        };
      }
    }

    // 🍎 Productos normales: Open Food Facts
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    );
    const data = await response.json();
    if (data.status === 1) {
      const p = data.product;
      return {
        code: barcode,
        name: p.product_name || "Producto desconocido",
        brand: p.brands || "Sin marca",
        image: p.image_small_url || null,
        url: p.url || buildSearchUrl("openfoodfacts", barcode),
        date: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error al consultar producto o libro:", error);
    return null;
  }
};
