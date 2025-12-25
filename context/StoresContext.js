import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 👉 cambia la ruta si tu JSON está en otro sitio
import storesData from "../data/stores.json";

const StoresContext = createContext(null);

export const useStores = () => {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores debe usarse dentro de StoresProvider");
  }
  return ctx;
};

const FAVORITES_KEY = "@favorite_stores";

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
        // 1️⃣ tiendas (catálogo)
        setStores(storesData);

        // 2️⃣ favoritas
        const favRaw = await AsyncStorage.getItem(FAVORITES_KEY);
        if (favRaw) {
          setFavorites(JSON.parse(favRaw));
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
    const next = favorites.includes(storeId)
      ? favorites.filter((id) => id !== storeId)
      : [...favorites, storeId];

    setFavorites(next);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

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
