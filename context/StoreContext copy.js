import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* -------------------------------------------------
   Context
-------------------------------------------------- */
const StoreContext = createContext(null);

/* -------------------------------------------------
   Provider
-------------------------------------------------- */
export function StoreProvider({ children }) {
  /**
   * Mapa:
   * {
   *   [listId]: storeId
   * }
   */
  const [storesByList, setStoresByList] = useState({});
  const [isReady, setIsReady] = useState(false);

  const STORAGE_KEY = "@storesByList";

  /* -------------------------------------------------
     Rehidratación
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setStoresByList(JSON.parse(raw));
        }
      } catch (err) {
        console.warn("Error loading StoreContext", err);
      } finally {
        setIsReady(true);
      }
    };

    load();
  }, []);

  /* -------------------------------------------------
     Persistencia
  -------------------------------------------------- */
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storesByList));
  }, [storesByList, isReady]);

  /* -------------------------------------------------
     API pública
  -------------------------------------------------- */
  const setStoreForList = (listId, storeId) => {
    if (!listId) return;
    setStoresByList((prev) => ({
      ...prev,
      [listId]: storeId,
    }));
  };

  const clearStoreForList = (listId) => {
    setStoresByList((prev) => {
      const copy = { ...prev };
      delete copy[listId];
      return copy;
    });
  };

  const getStoreIdForList = (listId) => {
    return storesByList[listId] || null;
  };

  /* -------------------------------------------------
     Memo
  -------------------------------------------------- */
  const value = useMemo(
    () => ({
      isReady,
      storesByList,

      setStoreForList,
      clearStoreForList,
      getStoreIdForList,
    }),
    [isReady, storesByList]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

/* -------------------------------------------------
   Hook
-------------------------------------------------- */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return ctx;
}
