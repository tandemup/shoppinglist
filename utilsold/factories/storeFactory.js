import { extractZipcode } from "../helpers/geo";

/**
 * Normaliza una tienda cruda (JSON, API, OSM)
 */
export const normalizeStore = (rawStore) => {
  if (!rawStore) return null;

  const { id, name, address, location } = rawStore;

  const zipcode = extractZipcode(address);

  return {
    // Identidad
    id,
    name,

    // Dirección
    address: address ?? null,
    zipcode,
    city: inferCity(address),
    region: "Asturias",
    country: "ES",

    // Geolocalización
    location: {
      latitude: location?.latitude,
      longitude: location?.longitude,
    },

    // Configuración visual (mapas / UI)
    display: {
      icon: inferIcon(name),
      color: inferColor(name),
      radius: 80,
      zone: inferZone(address),
    },

    // Metadatos
    meta: {
      brand: inferBrand(name),
      type: "supermarket",
      source: "local-json",
    },

    // Campos calculados (inicialmente null)
    distance: null,
    stats: null,
  };
};

/**
 * Normaliza una lista de tiendas
 */
export const normalizeStores = (stores = []) =>
  stores.map(normalizeStore).filter(Boolean);

/* ----------------- helpers internos ----------------- */

const inferBrand = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("mercadona")) return "Mercadona";
  if (n.includes("lidl")) return "Lidl";
  if (n.includes("dia")) return "DIA";
  if (n.includes("eroski")) return "Eroski";
  if (n.includes("alimerka")) return "Alimerka";
  if (n.includes("supercor")) return "Supercor";
  return name;
};

const inferIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("mercadona")) return "storefront";
  if (n.includes("lidl")) return "cart-outline";
  if (n.includes("dia")) return "pricetag-outline";
  if (n.includes("eroski")) return "basket-outline";
  return "storefront";
};

const inferColor = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("mercadona")) return "#2E7D32";
  if (n.includes("lidl")) return "#1E88E5";
  if (n.includes("dia")) return "#D32F2F";
  if (n.includes("eroski")) return "#C62828";
  if (n.includes("alimerka")) return "#00695C";
  return "#1976D2";
};

const inferCity = (address = "") => {
  if (!address) return null;
  if (address.toLowerCase().includes("oviedo")) return "Oviedo";
  if (address.toLowerCase().includes("gijón")) return "Gijón";
  return null;
};

const inferZone = (address = "") => {
  if (!address) return null;
  if (address.toLowerCase().includes("uría")) return "Centro";
  if (address.toLowerCase().includes("corrida")) return "Centro";
  if (address.toLowerCase().includes("constitución")) return "El Llano";
  return null;
};
