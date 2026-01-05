import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =================================================
   Context
================================================= */
const StoresContext = createContext(null);

/* =================================================
   MOCK / LOADER TEMPORAL
   👉 Sustituye esto por API / OSM cuando quieras
================================================= */
const loadStores = async () => {
  // EJEMPLO mínimo (pon aquí tu loader real)
  return [
    {
      id: "store-1",
      name: "Alcampo",
      city: "Oviedo",
      address: "Calle Mayor 12",
      location: { latitude: 43.36, longitude: -5.84 },
    },
    {
      id: "store-2",
      name: "Carrefour Express",
      city: "Gijón",
      address: "Av. de la Costa 45",
      location: { latitude: 43.53, longitude: -5.66 },
    },
  ];
};

/* =================================================
   Provider
================================================= */
export function StoresProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -----------------------------------------------
     Load stores (ONCE)
  ----------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const data = await loadStores();
        if (mounted) {
          setStores(data);
        }
      } catch (e) {
        console.error("Error loading stores", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  /* -----------------------------------------------
     Favorites
  ----------------------------------------------- */
  const toggleFavoriteStore = (storeId) => {
    setFavoriteStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const isFavoriteStore = (storeId) => favoriteStoreIds.includes(storeId);

  /* -----------------------------------------------
     Helpers
  ----------------------------------------------- */
  const getStoreById = (storeId) =>
    stores.find((s) => s.id === storeId) || null;

  /* -----------------------------------------------
     Context value
  ----------------------------------------------- */
  const value = useMemo(
    () => ({
      stores,
      loading,

      favoriteStoreIds,
      toggleFavoriteStore,
      isFavoriteStore,

      getStoreById,
      setStores, // útil si más adelante recargas desde API
    }),
    [stores, loading, favoriteStoreIds]
  );

  return (
    <StoresContext.Provider value={value}>{children}</StoresContext.Provider>
  );
}

/* =================================================
   Hook
================================================= */
export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores must be used within StoresProvider");
  }
  return ctx;
}
