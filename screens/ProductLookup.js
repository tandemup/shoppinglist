// export async function fetchProductInfo(code, signal, config) {
  const isISBN =
    code.length === 13 && (code.startsWith("978") || code.startsWith("979"));

  if (isISBN) {
    const google = await lookupGoogleBooks(code);
    if (google) return google;

    const open = await lookupOpenLibrary(code);
    if (open) return open;

    return {
      name: "Libro encontrado",
      brand: "",
      image: null,
      url: "https://www.google.com/search?q=isbn+" + code,
    };
  }

  // Producto normal
  return await fetchNormalProduct(code, signal, config);
}

//
// 📚 Google Books
//
async function lookupGoogleBooks(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return null;

    const b = data.items[0].volumeInfo;

    return {
      name: b.title,
      brand: b.authors ? b.authors.join(", ") : "",
      image: b.imageLinks?.thumbnail || null,
      url: `https://books.google.com/books?vid=ISBN${isbn}`,
    };
  } catch {
    return null;
  }
}

//
// 📚 OpenLibrary
//
async function lookupOpenLibrary(isbn) {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    const json = await res.json();

    const key = `ISBN:${isbn}`;
    const b = json[key];
    if (!b) return null;

    return {
      name: b.title,
      brand: b.publishers ? b.publishers.map((p) => p.name).join(", ") : "",
      image: b.cover?.medium || null,
      url: `https://openlibrary.org/isbn/${isbn}`,
    };
  } catch {
    return null;
  }
}

//
// 🧃 Productos normales: tu función existente
//
async function fetchNormalProduct(code, signal, config) {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`;
    const res = await fetch(url, { signal });
    const data = await res.json();

    if (data.status !== 1) {
      return {
        name: "Producto no encontrado",
        brand: "",
        image: null,
        url: "https://www.google.com/search?q=" + code,
      };
    }

    const p = data.product;

    return {
      name: p.product_name || "Producto",
      brand: p.brands,
      image: p.image_front_small_url || null,
      url: `https://world.openfoodfacts.org/product/${code}`,
    };
  } catch {
    return null;
  }
}
