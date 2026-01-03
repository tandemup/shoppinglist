// context/StoresContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import rawStores from "../data/stores.json";

const StoresContext = createContext(null);

export const useStores = () => {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores debe usarse dentro de StoresProvider");
  }
  return ctx;
};

const FAVORITES_KEY = "@favorite_stores";

// ────────────────────────────────────────────────
// NORMALIZACIÓN DE TIENDAS
// ────────────────────────────────────────────────
const normalizeStores = (stores) =>
  stores.filter(Boolean).map((store, index) => {
    const id = store.id ?? store.osm_id ?? store["@id"] ?? `store-${index}`;

    return {
      ...store,
      id: String(id), // 🔑 SIEMPRE string y nunca null
    };
  });

export function StoresProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────
  // CARGAR TIENDAS + FAVORITAS
  // ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const normalizedStores = normalizeStores(rawStores);
        setStores(normalizedStores);

        const favRaw = await AsyncStorage.getItem(FAVORITES_KEY);
        let validFavorites = [];

        if (favRaw) {
          const parsed = JSON.parse(favRaw);
          validFavorites = parsed.filter((id) =>
            normalizedStores.some((s) => s.id === id)
          );
          setFavorites(validFavorites);
        }
      } catch (e) {
        console.warn("Error loading stores", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);
  // ────────────────────────────────────────────────
  // FAVORITAS
  // ────────────────────────────────────────────────
  const toggleFavorite = async (storeId) => {
    const id = String(storeId);
    const next = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];

    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const isFavorite = (storeId) => favorites.includes(String(storeId));

  return (
    <StoresContext.Provider
      value={{
        stores,
        loading,
        favorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </StoresContext.Provider>
  );
}

export default StoresContext;
