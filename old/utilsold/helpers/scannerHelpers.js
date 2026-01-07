// utils/scannerHelpers.js — versión completa y funcional

// 🔍 Regex para detectar ISBN-10 o ISBN-13
export function isISBN(code) {
  if (!code) return false;

  const clean = code.replace(/[^0-9X]/gi, "");

  // ISBN-10
  if (/^\d{9}[0-9X]$/.test(clean)) return true;

  // ISBN-13 empieza por 978 o 979
  if (/^97[89]\d{10}$/.test(clean)) return true;

  return false;
}

// 📚 Obtener datos de libros usando OpenLibrary (o similar)
export async function fetchBookInfo(code) {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${code}&jscmd=data&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    const entry = data[`ISBN:${code}`];
    if (!entry) return null;

    return {
      name: entry.title ?? "Libro desconocido",
      brand: entry.publishers?.[0]?.name ?? "",
      image: entry.cover?.medium ?? null,
      url: entry.url ?? null,
    };
  } catch (e) {
    console.log("Error fetchBookInfo:", e);
    return null;
  }
}

// 🛒 Obtener datos de productos de supermercado
export async function fetchProductInfo(code) {
  try {
    // API pública de OpenFoodFacts
    const url = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.status !== 1) return null;

    const p = data.product;

    return {
      name: p.product_name ?? "Producto desconocido",
      brand: p.brands ?? "",
      image: p.image_front_small_url ?? null,
      url: p.url ?? null,
    };
  } catch (e) {
    console.log("Error fetchProductInfo:", e);
    return null;
  }
}
