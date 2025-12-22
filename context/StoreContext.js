import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const STORAGE_KEY = "@shopping_lists";

export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────
  // CARGAR LISTAS AL ARRANCAR
  // ────────────────────────────────────────────────
  useEffect(() => {
    const loadLists = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLists(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Error loading lists", e);
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  // ────────────────────────────────────────────────
  // GUARDAR LISTAS EN STORAGE
  // ────────────────────────────────────────────────
  const persist = async (nextLists) => {
    setLists(nextLists);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextLists));
  };

  // ────────────────────────────────────────────────
  // ACCIONES
  // ────────────────────────────────────────────────
  const addList = async (list) => {
    await persist([list, ...lists]);
  };

  const deleteList = async (listId) => {
    await persist(lists.filter((l) => l.id !== listId));
  };

  const archiveList = async (listId) => {
    await persist(
      lists.map((l) => (l.id === listId ? { ...l, archived: true } : l))
    );
  };

  return (
    <StoreContext.Provider
      value={{
        lists,
        loading,
        addList,
        deleteList,
        archiveList,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export default StoreContext;
