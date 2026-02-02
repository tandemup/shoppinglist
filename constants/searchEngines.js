// constants/searchEngines.js

export const SEARCH_ENGINES = {
  google: {
    id: "google",
    label: "Google",
    icon: "logo-google",
    buildUrl: (query) =>
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },

  google_shopping: {
    id: "google_shopping",
    label: "Google Shopping",
    icon: "logo-google",
    buildUrl: (query) =>
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
  },

  bing: {
    id: "bing",
    label: "Bing",
    icon: "search-outline",
    buildUrl: (query) =>
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },

  duckduckgo: {
    id: "duckduckgo",
    label: "DuckDuckGo",
    icon: "search-outline",
    buildUrl: (query) =>
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  },

  openfoodfacts: {
    id: "openfoodfacts",
    label: "OpenFoodFacts",
    icon: "nutrition-outline",
    buildUrl: (query) =>
      `https://world.openfoodfacts.org/product/${encodeURIComponent(query)}`,
  },

  barcodelookup: {
    id: "barcodelookup",
    label: "BarcodeLookup",
    icon: "barcode-outline",
    buildUrl: (query) =>
      `https://www.barcodelookup.com/${encodeURIComponent(query)}`,
  },
};

export const BOOK_ENGINES = {
  google_books: {
    id: "google_books",
    label: "Google Books",
    icon: "book-outline",
    buildUrl: (query) =>
      `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(query)}`,
  },

  open_library: {
    id: "open_library",
    label: "Open Library",
    icon: "library-outline",
    buildUrl: (query) =>
      `https://openlibrary.org/search?q=${encodeURIComponent(query)}`,
  },

  amazon_books: {
    id: "amazon_books",
    label: "Amazon Books",
    icon: "cart-outline",
    buildUrl: (query) =>
      `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=stripbooks`,
  },
};

export const DEFAULT_ENGINE = "google";
export const DEFAULT_BOOK_ENGINE = "google_books";
