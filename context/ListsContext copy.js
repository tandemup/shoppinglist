/**
 * ListsContext
 *
 * Gestiona listas de compra activas, archivadas
 * y el historial de compras (nivel ítem).
 */

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
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const LISTS_KEY = "@shoppingLists";
  const HISTORY_KEY = "@purchaseHistory";

  /* -------------------------------------------------
     Rehidratación
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [listsRaw, historyRaw] = await Promise.all([
          AsyncStorage.getItem(LISTS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);

        if (listsRaw) setLists(JSON.parse(listsRaw));
        if (historyRaw) setPurchaseHistory(JSON.parse(historyRaw));
      } catch (err) {
        console.warn("Error loading lists context", err);
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
    AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  }, [lists, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(purchaseHistory));
  }, [purchaseHistory, isReady]);

  /* -------------------------------------------------
     Helpers
  -------------------------------------------------- */
  const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  /* -------------------------------------------------
     Derivados
  -------------------------------------------------- */
  const activeLists = useMemo(() => lists.filter((l) => !l.archived), [lists]);
  const archivedLists = useMemo(() => lists.filter((l) => l.archived), [lists]);

  /* -------------------------------------------------
     API pública — Listas
  -------------------------------------------------- */
  const createList = (name) => {
    setLists((prev) => [
      ...prev,
      {
        id: generateId(),
        name,
        items: [],
        createdAt: Date.now(),
        archived: false,
        archivedAt: null,
        storeId: null,
      },
    ]);
  };

  const updateList = (listId, updates) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, ...updates } : l))
    );
  };

  const updateListStore = (listId, storeId) => {
    updateList(listId, { storeId });
  };

  const deleteList = (listId) => {
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const archiveList = (listId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, archived: true, archivedAt: Date.now() } : l
      )
    );
  };

  const restoreList = (listId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, archived: false, archivedAt: null } : l
      )
    );
  };

  /* -------------------------------------------------
     API pública — Items
  -------------------------------------------------- */
  const addItem = (listId, item) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [
                {
                  id: generateId(),
                  name: item?.name ?? "",
                  quantity: item?.quantity ?? 1,
                  unitPrice: item?.unitPrice ?? 0,
                  priceInfo: item?.priceInfo ?? null,
                  checked: item?.checked ?? true,
                  promo: item?.promo ?? null,
                },
                ...list.items,
              ],
            }
          : list
      )
    );
  };

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
     API pública — Historial
  -------------------------------------------------- */
  const addPurchaseHistory = (entry) => {
    setPurchaseHistory((prev) => [
      {
        id: generateId(),
        ...entry,
      },
      ...prev,
    ]);
  };

  /* -------------------------------------------------
     Memo
  -------------------------------------------------- */
  const value = useMemo(
    () => ({
      lists,
      activeLists,
      archivedLists,
      purchaseHistory,
      isReady,

      createList,
      updateList,
      updateListStore,
      deleteList,
      archiveList,
      restoreList,

      addItem,
      updateItem,
      deleteItem,

      addPurchaseHistory,
    }),
    [lists, activeLists, archivedLists, purchaseHistory, isReady]
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
