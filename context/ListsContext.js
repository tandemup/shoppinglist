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
const ListsContext = createContext(null);

/* -------------------------------------------------
   Provider
-------------------------------------------------- */
export function ListsProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const STORAGE_KEY = "@shoppingLists";

  /* -------------------------------------------------
     Rehidratación
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setLists(JSON.parse(raw));
        }
      } catch (err) {
        console.warn("Error loading lists", err);
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  }, [lists, isReady]);

  /* -------------------------------------------------
     Helpers
  -------------------------------------------------- */
  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  /* -------------------------------------------------
     API pública
  -------------------------------------------------- */

  // Crear lista
  const createList = (name) => {
    setLists((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        items: [],
        createdAt: Date.now(),
      },
    ]);
  };

  // Eliminar lista
  const deleteList = (listId) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  // Añadir item
  const addItem = (listId, item) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                ...list.items,
                {
                  id: generateId(),
                  name: item.name,
                  quantity: item.quantity ?? 1,
                  unitPrice: item.unitPrice ?? 0,
                  checked: item.checked ?? true,
                  promo: item.promo ?? null,
                },
              ],
            }
          : list
      )
    );
  };

  // Actualizar item
  const updateItem = (listId, itemId, updates) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : list
      )
    );
  };

  // Eliminar item
  const deleteItem = (listId, itemId) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((i) => i.id !== itemId),
            }
          : list
      )
    );
  };

  /* -------------------------------------------------
     Memo
  -------------------------------------------------- */
  const value = useMemo(
    () => ({
      lists,
      isReady,

      createList,
      deleteList,

      addItem,
      updateItem,
      deleteItem,
    }),
    [lists, isReady]
  );

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}

/* -------------------------------------------------
   Hook
-------------------------------------------------- */
export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) {
    throw new Error("useLists must be used inside ListsProvider");
  }
  return ctx;
}
