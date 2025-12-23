import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext(null);

const STORAGE_KEY = "@favorite_stores";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar favoritos al iniciar
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setFavorites(JSON.parse(raw));
        }
      } catch (e) {
        console.warn("Error cargando favoritos", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Guardar cuando cambian
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  const toggleFavorite = (storeId) => {
    setFavorites((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
