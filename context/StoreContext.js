import React, { createContext, useContext, useState, useEffect } from "react";

import {
  loadLists,
  addList as storageAddList,
  deleteList as storageDeleteList,
  updateList,
} from "../utils/storage/listStorage";

import {
  loadHistory,
  saveHistory,
} from "../utils/storage/purchaseHistoryStorage";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  //
  // 📌 CARGAR DATOS AL INICIAR
  //
  useEffect(() => {
    (async () => {
      const listData = await loadLists();
      setLists(listData);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData);
    })();
  }, []);

  //
  // 🧾 ➕ AÑADIR LISTA
  //
  const addList = async (newList) => {
    await storageAddList(newList);
    const updated = await loadLists();
    setLists(updated);
  };

  //
  // 🧾 ✏️ RENOMBRAR LISTA
  //
  const updateListName = async (id, newName) => {
    await updateList(id, (base) => ({
      ...base,
      name: newName,
    }));
    const updated = await loadLists();
    setLists(updated);
  };

  //
  // 🧾 🗑 ELIMINAR LISTA
  //
  const deleteList = async (id) => {
    await storageDeleteList(id);
    const updated = await loadLists();
    setLists(updated);
  };

  //
  // 🧾 📦 ARCHIVAR LISTA (PAGADA)
  //
  const archiveList = async (id) => {
    await updateList(id, (base) => ({
      ...base,
      archived: true,
    }));
    const updated = await loadLists();
    setLists(updated);
  };

  //
  // 🧾 📚 AÑADIR ITEMS AL HISTORIAL
  //
  const addItemsToHistory = async (items) => {
    const currentHistory = await loadHistory();
    const stamped = items.map((i) => ({
      ...i,
      purchasedAt: new Date().toISOString(),
    }));

    const updated = [...currentHistory, ...stamped];
    await saveHistory(updated);
    setPurchaseHistory(updated);
  };

  return (
    <StoreContext.Provider
      value={{
        lists,
        setLists,
        purchaseHistory,

        addList,
        deleteList,
        updateListName,
        archiveList,
        addItemsToHistory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
