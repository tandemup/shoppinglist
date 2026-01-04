import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import storesData from "../data/stores.json";

/* -------------------------------------------------
   Context
-------------------------------------------------- */
const StoresContext = createContext(null);

/* -------------------------------------------------
   Storage keys
-------------------------------------------------- */
const STORES_KEY = "@stores";
const FAVORITES_KEY = "@favoriteStoreIds";
const STORES_INIT_KEY = "@stores_initialized";

/* -------------------------------------------------
   Provider
-------------------------------------------------- */
export function StoresProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState([]);
  const [isReady, setIsReady] = useState(false);

  /* -------------------------------------------------
     Initial load (JSON only once)
  -------------------------------------------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const initialized = await AsyncStorage.getItem(STORES_INIT_KEY);

        // 🟢 First run → load from JSON
        if (!initialized) {
          setStores(storesData);

          await AsyncStorage.setItem(STORES_KEY, JSON.stringify(storesData));
          await AsyncStorage.setItem(STORES_INIT_KEY, "true");
        }
        // 🔵 Next runs → load from storage
        else {
          const storedStores = await AsyncStorage.getItem(STORES_KEY);

          if (storedStores) {
            setStores(JSON.parse(storedStores));
          }
        }

        // Load favorites
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
          setFavoriteStoreIds(JSON.parse(storedFavorites));
        }

        setIsReady(true);
      } catch (e) {
        console.error("Error initializing stores", e);
        setIsReady(true);
      }
    };

    init();
  }, []);

  /* -------------------------------------------------
     Persist stores
  -------------------------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    AsyncStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }, [stores, isReady]);

  /* -------------------------------------------------
     Persist favorites
  -------------------------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteStoreIds));
  }, [favoriteStoreIds, isReady]);

  /* -------------------------------------------------
     API
  -------------------------------------------------- */

  const setAllStores = (list) => {
    setStores(Array.isArray(list) ? list : []);
  };

  const getStoreById = (storeId) => {
    return stores.find((s) => s.id === storeId) || null;
  };

  const isFavorite = (storeId) => {
    return favoriteStoreIds.includes(storeId);
  };

  const toggleFavoriteStore = (storeId) => {
    setFavoriteStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  /* -------------------------------------------------
     Memoized value
  -------------------------------------------------- */
  const value = useMemo(
    () => ({
      stores,
      favoriteStoreIds,
      isReady,

      setAllStores,
      getStoreById,

      isFavorite,
      toggleFavoriteStore,
    }),
    [stores, favoriteStoreIds, isReady]
  );

  return (
    <StoresContext.Provider value={value}>{children}</StoresContext.Provider>
  );
}

/* -------------------------------------------------
   Hook
-------------------------------------------------- */
export function useStores() {
  const ctx = useContext(StoresContext);
  if (!ctx) {
    throw new Error("useStores must be used inside StoresProvider");
  }
  return ctx;
}
