// StoreContext.js — VERSIÓN CORREGIDA Y ESTABLE
// Mantiene priceInfo, qty, unitPrice, promociones, summary, unit, etc.

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  loadLists,
  saveLists,
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

  // -----------------------------------------------------------
  // CONFIGURACIÓN
  // -----------------------------------------------------------

  const [config, setConfig] = useState({
    search: {
      generalEngine: "google",
      bookEngine: "googleBooks",
    },
  });

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("@expo-shop/config");
      if (stored) setConfig(JSON.parse(stored));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@expo-shop/config", JSON.stringify(config));
  }, [config]);

  const setGeneralEngine = (engine) =>
    setConfig((prev) => ({
      ...prev,
      search: { ...prev.search, generalEngine: engine },
    }));

  const setBookEngine = (engine) =>
    setConfig((prev) => ({
      ...prev,
      search: { ...prev.search, bookEngine: engine },
    }));

  // -----------------------------------------------------------
  // NORMALIZACIÓN DEL ITEM
  // -----------------------------------------------------------

  const normalizeItem = (i) => {
    // Normalización suave. No destruimos nada.
    const qty = Number(i.priceInfo?.qty ?? i.qty ?? i.quantity ?? 1);
    const unitPrice = Number(i.priceInfo?.unitPrice ?? i.unitPrice ?? null);
    const total = Number(i.priceInfo?.total ?? i.price ?? 0);

    return {
      ...i,

      // Cantidad real
      quantity: qty,
      qty,

      // priceInfo preservada
      priceInfo: {
        total,
        unitPrice,
        qty,
        promo: i.priceInfo?.promo ?? "none",
        summary: i.priceInfo?.summary ?? null,
      },
    };
  };

  const normalizeStore = (s) => {
    if (!s) return null;
    if (typeof s === "string") return s;
    if (s.name) return s.name;
    return null;
  };

  // -----------------------------------------------------------
  // CARGA INICIAL LISTAS + HISTORIAL
  // -----------------------------------------------------------

  useEffect(() => {
    (async () => {
      const listData = await loadLists();

      const sortedLists = [...listData].sort(
        (a, b) =>
          new Date(b.createdAt || 0).valueOf() -
          new Date(a.createdAt || 0).valueOf()
      );

      setLists(sortedLists);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData.map(normalizeItem));
    })();
  }, []);

  // -----------------------------------------------------------
  // CRUD LISTAS
  // -----------------------------------------------------------

  const addList = async (newList) => {
    await storageAddList(newList);
    const updated = await loadLists();
    setLists(
      updated.sort(
        (a, b) =>
          new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
      )
    );
  };

  const updateListName = async (id, newName) => {
    await updateList(id, (base) => ({ ...base, name: newName }));
    setLists(await loadLists());
  };

  const deleteList = async (id) => {
    await storageDeleteList(id);
    setLists(await loadLists());
  };

  // -----------------------------------------------------------
  // ARCHIVAR LISTA — YA NO DESTRUYE LOS DATOS
  // -----------------------------------------------------------

  const archiveList = async (id) => {
    const allLists = await loadLists();
    const target = allLists.find((l) => l.id === id);
    if (!target) return;

    // Conservamos priceInfo completo
    const itemsToHistory = (target.items || []).map((i) =>
      normalizeItem({
        ...i,
        listName: target.name,
        store: normalizeStore(target.store),
        purchasedAt: new Date().toISOString(),
      })
    );

    // Guardar en historial
    const existingHistory = await loadHistory();
    const updatedHistory = [...existingHistory, ...itemsToHistory];

    await saveHistory(updatedHistory);
    setPurchaseHistory(updatedHistory.map(normalizeItem));

    // Marcar la lista como archivada sin tocar items
    await updateList(id, (prev) => ({
      ...prev,
      archived: true,
      archivedAt: new Date().toISOString(),
      store: normalizeStore(prev.store),
      items: prev.items.map(normalizeItem),
    }));

    // Recargar listas
    const refreshed = await loadLists();
    setLists(
      refreshed.sort(
        (a, b) =>
          new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
      )
    );
  };

  // -----------------------------------------------------------
  // OTROS
  // -----------------------------------------------------------

  const addItemsToHistory = async (items) => {
    const base = await loadHistory();
    const stamped = items.map((i) =>
      normalizeItem({
        ...i,
        purchasedAt: new Date().toISOString(),
      })
    );

    const updated = [...base, ...stamped];
    await saveHistory(updated);
    setPurchaseHistory(updated);
  };

  const fetchLists = async () => {
    const loaded = await loadLists();
    setLists(
      loaded.sort(
        (a, b) =>
          new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
      )
    );
    return loaded;
  };

  const clearActiveLists = async () => {
    const arch = lists.filter((l) => l.archived);
    await saveLists(arch);
    setLists(arch);
  };

  const clearArchivedLists = async () => {
    const all = await loadLists();
    const nonArch = all.filter((l) => !l.archived);
    await saveLists(nonArch);
    setLists(nonArch);
  };

  const clearPurchaseHistory = async () => {
    await saveHistory([]);
    setPurchaseHistory([]);
  };

  const clearScannedHistory = async () =>
    AsyncStorage.setItem("@expo-shop/scanned-history", JSON.stringify([]));

  // -----------------------------------------------------------
  return (
    <StoreContext.Provider
      value={{
        lists,
        archivedLists: lists.filter((l) => l.archived),
        activeLists: lists.filter((l) => !l.archived),

        config,
        setGeneralEngine,
        setBookEngine,

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
