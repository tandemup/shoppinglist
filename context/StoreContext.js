// StoreContext.js — versión FINAL integrada y limpia

import React, { createContext, useContext, useState, useEffect } from "react";

// ⭐ Importamos helpers OFICIALES del almacenamiento
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
  // 📌 Cargar datos al iniciar
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
  // ➕ AÑADIR LISTA
  //
  const addList = async (newList) => {
    await storageAddList(newList);

    const updated = await loadLists();
    const sorted = updated.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    setLists(sorted);
  };

  //
  // ✏️ RENOMBRAR LISTA
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
  // 🗑 ELIMINAR LISTA — VERSIÓN FINAL
  //
  const deleteList = async (id) => {
    await storageDeleteList(id);

    const updated = await loadLists();
    const sorted = updated.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    setLists(sorted);
  };

  //
  // 📦 ARCHIVAR LISTA — VERSIÓN FINAL
  //
  const archiveList = async (id) => {
    await updateList(id, (base) => ({
      ...base,
      archived: true,
      archivedAt: Date.now(),
    }));

    const updated = await loadLists();
    const sorted = updated.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    setLists(sorted);
  };

  //
  // 📚 HISTORIAL DE COMPRAS
  //
  const addItemsToHistory = async (items) => {
    const current = await loadHistory();

    const stamped = items.map((i) => ({
      ...i,
      purchasedAt: new Date().toISOString(),
    }));

    const updated = [...current, ...stamped];
    await saveHistory(updated);
    setPurchaseHistory(updated);
  };

  //
  // 🔄 fetchLists OFICIAL (usado por pantallas)
  //
  const fetchLists = async () => {
    const loaded = await loadLists();

    // ⭐ ORDENAR — nueva lista primero
    const sorted = loaded.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    setLists(sorted);
    return sorted;
  };

  return (
    <StoreContext.Provider
      value={{
        lists,
        purchaseHistory,

        addList,
        deleteList,
        updateListName,
        archiveList,
        addItemsToHistory,
        fetchLists,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
