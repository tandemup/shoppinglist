// StoreContext.js — VERSIÓN FINAL SIN NANOID

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helpers de listas
import {
  loadLists,
  saveLists,
  addList as storageAddList,
  deleteList as storageDeleteList,
  updateList,
} from "../utils/storage/listStorage";

// Helpers de historial
import {
  loadHistory,
  saveHistory,
} from "../utils/storage/purchaseHistoryStorage";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // ────────────────────────────────────────────────
  // CARGA INICIAL
  // ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const listData = await loadLists();
      const sorted = [...listData].sort((a, b) => {
        const A = new Date(a.createdAt || 0).getTime();
        const B = new Date(b.createdAt || 0).getTime();
        return B - A;
      });
      setLists(sorted);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData);
    })();
  }, []);

  // ────────────────────────────────────────────────
  // LISTAS DERIVADAS
  // ────────────────────────────────────────────────
  const archivedLists = lists.filter((l) => l.archived);
  const activeLists = lists.filter((l) => !l.archived);

  // ────────────────────────────────────────────────
  // AÑADIR LISTA
  // ────────────────────────────────────────────────
  const addList = async (newList) => {
    await storageAddList(newList);
    const updated = await loadLists();
    const sorted = [...updated].sort((a, b) => {
      const A = new Date(a.createdAt || 0).getTime();
      const B = new Date(b.createdAt || 0).getTime();
      return B - A;
    });
    setLists(sorted);
  };

  // ────────────────────────────────────────────────
  // RENOMBRAR LISTA
  // ────────────────────────────────────────────────
  const updateListName = async (id, newName) => {
    await updateList(id, (base) => ({ ...base, name: newName }));
    const updated = await loadLists();
    setLists(updated);
  };

  // ────────────────────────────────────────────────
  // ELIMINAR LISTA
  // ────────────────────────────────────────────────
  const deleteList = async (id) => {
    await storageDeleteList(id);
    const updated = await loadLists();
    const sorted = [...updated].sort((a, b) => {
      const A = new Date(a.createdAt || 0).getTime();
      const B = new Date(b.createdAt || 0).getTime();
      return B - A;
    });
    setLists(sorted);
  };

  // ────────────────────────────────────────────────
  // ARCHIVAR LISTA
  // (Normaliza items + crea historial + guarda lista archivada limpia)
  // ────────────────────────────────────────────────
  const archiveList = async (id) => {
    const allLists = await loadLists();
    const target = allLists.find((l) => l.id === id);
    if (!target) return;

    // Normalización de tienda
    const normalizeStore = (storeObj) => {
      if (!storeObj) return null;
      if (typeof storeObj === "string") return storeObj;
      if (storeObj.name) return storeObj.name;
      return null;
    };

    // Normalización de item
    const normalizeItem = (i) => {
      const quantity =
        Number(i.quantity) || Number(i.qty) || Number(i.priceInfo?.qty) || 1;

      const price = Number(i.price) || Number(i.priceInfo?.total) || 0;

      return {
        id: i.id,
        name: i.name,
        barcode: i.barcode ?? null,
        quantity,
        price,
      };
    };

    // 1️⃣ Items volcados al historial
    const itemsToAdd = (target.items || []).map((i) => ({
      ...normalizeItem(i),
      listName: target.name,
      store: normalizeStore(target.store),
      purchasedAt: new Date().toISOString(),
    }));

    const existingHistory = await loadHistory();
    const updatedHistory = [...existingHistory, ...itemsToAdd];

    await saveHistory(updatedHistory);
    setPurchaseHistory(updatedHistory);

    // 2️⃣ Lista archivada con items ya normalizados
    await updateList(id, (base) => ({
      ...base,
      archived: true,
      archivedAt: new Date().toISOString(),
      store: base.store ? normalizeStore(base.store) : null,
      items: (base.items || []).map(normalizeItem),
    }));

    // 3️⃣ Recargar listas
    const refreshed = await loadLists();
    const sorted = [...refreshed].sort((a, b) => {
      const A = new Date(a.createdAt || 0).getTime();
      const B = new Date(b.createdAt || 0).getTime();
      return B - A;
    });
    setLists(sorted);
  };

  // ────────────────────────────────────────────────
  // AÑADIR ITEMS AL HISTORIAL DESDE "PAGAR"
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // RECARGAR LISTAS
  // ────────────────────────────────────────────────
  const fetchLists = async () => {
    const loaded = await loadLists();
    const sorted = [...loaded].sort((a, b) => {
      const A = new Date(a.createdAt || 0).getTime();
      const B = new Date(b.createdAt || 0).getTime();
      return B - A;
    });
    setLists(sorted);
    return sorted;
  };

  // ────────────────────────────────────────────────
  // BORRADOS SELECTIVOS
  // ────────────────────────────────────────────────
  const clearActiveLists = async () => {
    const remaining = lists.filter((l) => l.archived);
    await saveLists(remaining);
    setLists(remaining);
  };

  const clearArchivedLists = async () => {
    try {
      const all = await loadLists();
      const remaining = all.filter((l) => !l.archived);

      await saveLists(remaining);

      const sorted = [...remaining].sort((a, b) => {
        const A = new Date(a.createdAt || 0).getTime();
        const B = new Date(b.createdAt || 0).getTime();
        return B - A;
      });

      setLists(sorted);
    } catch (err) {
      console.log("❌ Error clearing archived lists:", err);
    }
  };

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

  // ────────────────────────────────────────────────
  // PROVEEDOR
  // ────────────────────────────────────────────────
  return (
    <StoreContext.Provider
      value={{
        lists,
        archivedLists,
        activeLists,

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
