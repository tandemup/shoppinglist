import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StoresContext = createContext();

const STORAGE_KEY = "STORES_DATA";

const initialStores = [
  {
    id: "1",
    name: "Carrefour Express",
    city: "Gijón",
    distance: 835,
    favorite: false,
  },
  {
    id: "2",
    name: "Alcampo",
    city: "Oviedo",
    distance: 24500,
    favorite: false,
  },
];

export const StoresProvider = ({ children }) => {
  const [stores, setStores] = useState([]);

  // 🔹 Cargar stores
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setStores(JSON.parse(raw));
        } else {
          setStores(initialStores);
        }
      } catch (e) {
        console.warn("Error loading stores", e);
        setStores(initialStores);
      }
    };
    load();
  }, []);

  // 🔹 Persistir cambios
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
  }, [stores]);

  // ⭐ Toggle favorito (función base)
  const toggleFavorite = (storeId) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, favorite: !s.favorite } : s))
    );
  };

  // ⭐ Alias semántico (el que usa StoreRow)
  const toggleFavoriteStore = (storeId) => {
    toggleFavorite(storeId);
  };

  // ⭐ IDs de favoritas
  const favoriteStoreIds = stores.filter((s) => s.favorite).map((s) => s.id);

  // ⭐ Helper seguro
  const isFavoriteStore = (storeId) => {
    return favoriteStoreIds.includes(storeId);
  };

  // ⭐ Listado de favoritas
  const favoriteStores = stores.filter((s) => s.favorite);

  return (
    <StoresContext.Provider
      value={{
        stores,
        favoriteStores,
        favoriteStoreIds,
        toggleFavorite,
        toggleFavoriteStore,
        isFavoriteStore,
      }}
    >
      {children}
    </StoresContext.Provider>
  );
};

export const useStores = () => {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores must be used within StoresProvider");
  }
  return ctx;
};
