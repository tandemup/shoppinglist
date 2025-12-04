// StoreContext.js — Versión final optimizada (con motores de búsqueda + precio unitario correcto)

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

  //
  // CONFIGURACIÓN (Motores de búsqueda)
  //
  const [config, setConfig] = useState({
    search: {
      generalEngine: "google",
      bookEngine: "googleBooks",
    },
  });

  //
  // CARGA DE CONFIG DESDE STORAGE
  //
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

  //
  // GUARDADO AUTOMÁTICO DE CONFIG
  //
  useEffect(() => {
    AsyncStorage.setItem("@expo-shop/config", JSON.stringify(config));
  }, [config]);

  //
  // CARGA INICIAL
  //
  useEffect(() => {
    (async () => {
      const listData = await loadLists();

      const sortedLists = [...listData].sort((a, b) => {
        const A = new Date(a.createdAt || 0).getTime();
        const B = new Date(b.createdAt || 0).getTime();
        return B - A;
      });

      setLists(sortedLists);

      const historyData = await loadHistory();
      setPurchaseHistory(historyData);
    })();
  }, []);

  //
  // DERIVADOS
  //
  const archivedLists = lists.filter((l) => l.archived);
  const activeLists = lists.filter((l) => !l.archived);

  //
  // SETTERS Motores de búsqueda
  //
  const setGeneralEngine = (engine) => {
    setConfig((prev) => ({
      ...prev,
      search: { ...prev.search, generalEngine: engine },
    }));
  };

  const setBookEngine = (engine) => {
    setConfig((prev) => ({
      ...prev,
      search: { ...prev.search, bookEngine: engine },
    }));
  };

  //
  // CRUD LISTAS
  //
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

  //
  // NORMALIZACIÓN DE ITEMS (CORREGIDA)
  //
  const normalizeItem = (i) => {
    const quantity =
      Number(i.quantity) || Number(i.qty) || Number(i.priceInfo?.qty) || 1;

    // Precio total — se intenta obtener desde múltiples estructuras
    const totalPrice =
      Number(i.priceInfo?.total) ||
      Number(i.total) ||
      Number(i.priceTotal) ||
      Number(i.price) ||
      0;

    // Precio unitario — ahora SIEMPRE correcto
    const unitPrice =
      Number(i.price) > 0
        ? Number(i.price)
        : quantity > 0
        ? totalPrice / quantity
        : 0;

    return {
      id: i.id,
      name: i.name,
      barcode: i.barcode ?? null,
      quantity,
      price: unitPrice,
    };
  };

  //
  // NORMALIZACIÓN DE TIENDA
  //
  const normalizeStore = (storeObj) => {
    if (!storeObj) return null;
    if (typeof storeObj === "string") return storeObj;
    if (storeObj.name) return storeObj.name;
    return null;
  };

  //
  // ARCHIVAR LISTA
  //
  const archiveList = async (id) => {
    const allLists = await loadLists();
    const target = allLists.find((l) => l.id === id);
    if (!target) return;

    // 1️⃣ Items hacia Historial (normalizados correctamente)
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

    // 2️⃣ Actualizar la lista archivada
    await updateList(id, (base) => ({
      ...base,
      archived: true,
      archivedAt: new Date().toISOString(),
      store: normalizeStore(base.store),
      items: (base.items || []).map(normalizeItem),
    }));

    // 3️⃣ Recargar listas ordenadas
    const refreshed = await loadLists();
    const sorted = [...refreshed].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
  };

  //
  // AÑADIR ITEMS AL HISTORIAL DESDE PAGO
  //
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

  //
  // RECARGAR LISTAS
  //
  const fetchLists = async () => {
    const loaded = await loadLists();
    const sorted = [...loaded].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLists(sorted);
    return sorted;
  };

  //
  // BORRADOS SELECTIVOS
  //
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

  //
  // EXPORTACIÓN DEL CONTEXTO
  //
  return (
    <StoreContext.Provider
      value={{
        lists,
        archivedLists,
        activeLists,

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
