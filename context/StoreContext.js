// StoreContext.js — versión FINAL con limpieza selectiva, explosión de items, historial separado

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Helpers de listas
import {
  loadLists,
  saveLists,
  addList as storageAddList,
  deleteList as storageDeleteList,
  updateList,
} from "../utils/storage/listStorage";

// 🔹 Helpers de historial de compras
import {
  loadHistory,
  saveHistory,
} from "../utils/storage/purchaseHistoryStorage";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // ------------------------------------------------------
  // 🔄 CARGA INICIAL
  // ------------------------------------------------------
  useEffect(() => {
    (async () => {
      const listData = await loadLists();
      setLists(listData);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData);
    })();
  }, []);

  // ------------------------------------------------------
  // ➕ AÑADIR LISTA
  // ------------------------------------------------------
  const addList = async (newList) => {
    await storageAddList(newList);
    const updated = await loadLists();
    setLists(updated.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  // ------------------------------------------------------
  // ✏️ RENOMBRAR LISTA
  // ------------------------------------------------------
  const updateListName = async (id, newName) => {
    await updateList(id, (base) => ({ ...base, name: newName }));
    const updated = await loadLists();
    setLists(updated);
  };

  // ------------------------------------------------------
  // 🗑 ELIMINAR LISTA
  // ------------------------------------------------------
  const deleteList = async (id) => {
    await storageDeleteList(id);
    const updated = await loadLists();
    setLists(updated.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  // ------------------------------------------------------
  // 📦 ARCHIVAR LISTA → Explota items al historial de compras
  // ------------------------------------------------------
  const archiveList = async (id) => {
    const allLists = await loadLists();
    const target = allLists.find((l) => l.id === id);
    if (!target) return;

    // 1️⃣ Preparar items para historial
    const normalizeStore = (storeObj) => {
      if (!storeObj) return null;
      if (typeof storeObj === "string") return storeObj;
      if (storeObj.name) return storeObj.name;
      return JSON.stringify(storeObj); // fallback
    };

    const itemsToAdd = (target.items || []).map((i) => ({
      ...i,
      listName: target.name,
      barcode: i.barcode ?? null,
      qty: i.priceInfo?.qty ?? 1,
      price: i.priceInfo?.total ?? 0,
      store: normalizeStore(target.store),
      purchasedAt: new Date().toISOString(),
    }));

    // 2️⃣ Añadir al historial de compras
    const existing = await loadHistory();
    const updatedHistory = [...existing, ...itemsToAdd];

    await saveHistory(updatedHistory);
    setPurchaseHistory(updatedHistory);

    // 3️⃣ Marcar lista como archivada
    await updateList(id, (base) => ({
      ...base,
      archived: true,
      archivedAt: Date.now(),
    }));

    // 4️⃣ Refrescar listas
    const refreshed = await loadLists();
    setLists(refreshed.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  };

  // ------------------------------------------------------
  // 🧾 Añadir items al historial (desde botón pagar)
  // ------------------------------------------------------
  const addItemsToHistory = async (items) => {
    const base = await loadHistory();
    const stamped = items.map((i) => ({
      ...i,
      purchasedAt: new Date().toISOString(),
    }));

    const updated = [...base, ...stamped];
    await saveHistory(updated);
    setPurchaseHistory(updated);
  };

  // ------------------------------------------------------
  // 🔄 REFRESCAR LISTAS
  // ------------------------------------------------------
  const fetchLists = async () => {
    const loaded = await loadLists();
    const sorted = loaded.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    setLists(sorted);
    return sorted;
  };

  // ------------------------------------------------------
  // 🧹 BORRADO SELECTIVO
  // ------------------------------------------------------

  // 1️⃣ Borrar listas activas
  const clearActiveLists = async () => {
    const remaining = lists.filter((l) => l.archived);
    await saveLists(remaining);
    setLists(remaining);
  };

  // 2️⃣ Borrar listas archivadas
  const clearArchivedLists = async () => {
    try {
      // 1️⃣ Leer listas reales desde el almacenamiento
      const all = await loadLists();

      // 2️⃣ Eliminar las archivadas
      const remaining = all.filter((l) => !l.archived);

      // 3️⃣ Guardar nuevas listas (solo activas)
      await saveLists(remaining);

      // 4️⃣ Ordenar y actualizar estado directamente (sin segunda lectura)
      const sorted = [...remaining].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
      );

      setLists(sorted);
    } catch (err) {
      console.log("❌ Error clearing archived lists:", err);
    }
  };

  // 3️⃣ Borrar historial de compras
  const clearPurchaseHistory = async () => {
    await saveHistory([]);
    setPurchaseHistory([]);
  };
  const clearScannedHistory = async () => {
    await AsyncStorage.setItem(
      "@expo-shop/scanned-history",
      JSON.stringify([])
    );
  };

  // ------------------------------------------------------

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

        clearActiveLists,
        clearArchivedLists,
        clearPurchaseHistory,
        clearScannedHistory,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
