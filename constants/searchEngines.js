const generalEngines = [
  { id: "openfoodfacts", label: "OpenFoodFacts", icon: "nutrition-outline" },
  { id: "google_shopping", label: "Google Shopping", icon: "logo-google" },
  { id: "duckduckgo", label: "DuckDuckGo", icon: "search-outline" },
  { id: "barcodelookup", label: "BarcodeLookup", icon: "barcode-outline" },
];

// constants/searchEngines.js
export const SEARCH_ENGINES = {
  google: {
    icon: "logo-google",
    label: "Google",
    buildUrl: (query) =>
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  },
  bing: {
    icon: "bing",
    label: "Bing",
    buildUrl: (query) =>
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
  },
  duckduckgo: {
    icon: "search-outline",
    label: "DuckDuckGo",
    buildUrl: (query) =>
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  },
};
