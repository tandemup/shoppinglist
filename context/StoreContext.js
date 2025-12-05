// StoreContext.js — Versión final con estructura correcta (Opción A)
// Mantiene qty, unitPrice y price total exactamente como el usuario los introduce

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

// Helpers del historial
import {
  loadHistory,
  saveHistory,
} from "../utils/storage/purchaseHistoryStorage";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  // -----------------------------------------------------------
  // CONFIGURACIÓN (Motores de búsqueda)
  // -----------------------------------------------------------

  const [config, setConfig] = useState({
    search: {
      generalEngine: "google",
      bookEngine: "googleBooks",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("@expo-shop/config");
        if (stored) setConfig(JSON.parse(stored));
      } catch (e) {
        console.log("Error cargando configuración:", e);
      }
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
  // CARGA INICIAL DE LISTAS + HISTORIAL
  // -----------------------------------------------------------

  useEffect(() => {
    (async () => {
      const listData = await loadLists();

      const sortedLists = [...listData].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

      setLists(sortedLists);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData);
    })();
  }, []);

  // -----------------------------------------------------------
  // NORMALIZACIÓN (Compatibilidad con datos antiguos)
  // -----------------------------------------------------------

  const normalizeItem = (i) => {
    // Cantidad real
    const quantity =
      Number(i.qty) || Number(i.quantity) || Number(i.priceInfo?.qty) || 1;

    // Precio total REAL introducido por el usuario
    const totalPrice =
      Number(i.price) ||
      Number(i.total) ||
      Number(i.priceTotal) ||
      Number(i.priceInfo?.total) ||
      0;

    // Precio unitario REAL introducido por el usuario (si existe)
    const unitPrice =
      Number(i.unitPrice) || Number(i.priceInfo?.unitPrice) || null; // si no existe, lo dejamos en null sin inventarlo

    return {
      id: i.id,
      name: i.name,
      barcode: i.barcode ?? null,

      qty: quantity,
      quantity,

      price: totalPrice,
      unitPrice: unitPrice,

      image: i.image ?? null,
    };
  };

  const normalizeStore = (storeObj) => {
    if (!storeObj) return null;
    if (typeof storeObj === "string") return storeObj;
    if (storeObj.name) return storeObj.name;
    return null;
  };

  // -----------------------------------------------------------
  // CRUD LISTAS
  // -----------------------------------------------------------

  const addList = async (newList) => {
    await storageAddList(newList);
    const updated = await loadLists();
    const sorted = [...updated].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
  };

  const updateListName = async (id, newName) => {
    await updateList(id, (base) => ({ ...base, name: newName }));
    const updated = await loadLists();
    setLists(updated);
  };

  const deleteList = async (id) => {
    await storageDeleteList(id);
    const updated = await loadLists();
    const sorted = [...updated].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
  };

  // -----------------------------------------------------------
  // ARCHIVAR LISTA (Se respeta precio total, unitario y cantidad)
  // -----------------------------------------------------------

  const archiveList = async (id) => {
    const allLists = await loadLists();
    const target = allLists.find((l) => l.id === id);
    if (!target) return;

    const itemsToHistory = (target.items || []).map((i) => ({
      ...normalizeItem(i),

      listName: target.name,
      store: normalizeStore(target.store),

      purchasedAt: new Date().toISOString(),
    }));

    const existingHistory = await loadHistory();
    const updatedHistory = [...existingHistory, ...itemsToHistory];

    await saveHistory(updatedHistory);
    setPurchaseHistory(updatedHistory);

    // Marcamos la lista como archivada sin destruir precios
    await updateList(id, (base) => ({
      ...base,
      archived: true,
      archivedAt: new Date().toISOString(),
      store: normalizeStore(base.store),

      // También normalizamos items dentro de la lista archivada
      items: (base.items || []).map(normalizeItem),
    }));

    // Recargar listas
    const refreshed = await loadLists();
    const sorted = [...refreshed].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
  };

  // -----------------------------------------------------------
  // AÑADIR ITEMS AL HISTORIAL (otros flujos)
  // -----------------------------------------------------------

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

  // -----------------------------------------------------------
  // RECARGAR LISTAS
  // -----------------------------------------------------------

  const fetchLists = async () => {
    const loaded = await loadLists();
    const sorted = [...loaded].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
    return sorted;
  };

  // -----------------------------------------------------------
  // BORRADOS SELECTIVOS
  // -----------------------------------------------------------

  const clearActiveLists = async () => {
    const remaining = lists.filter((l) => l.archived);
    await saveLists(remaining);
    setLists(remaining);
  };

  const clearArchivedLists = async () => {
    const all = await loadLists();
    const remaining = all.filter((l) => !l.archived);
    await saveLists(remaining);
    setLists(remaining);
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

  // -----------------------------------------------------------
  // EXPORTACIÓN DEL CONTEXTO
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
