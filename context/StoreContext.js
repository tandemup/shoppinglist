// StoreContext.js — versión corregida con reload()
// Expo-Shop 2025

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultPriceInfo } from "../utils/defaultItem";

const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);

// -----------------------------------------
// Helpers
// -----------------------------------------
async function load(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function save(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// -----------------------------------------
// Normalización
// -----------------------------------------
function normalizeItem(item) {
  if (!item) return null;

  const base = item.priceInfo || {};

  const qty = Number(base.qty ?? item.qty ?? 1);
  const unitPrice = Number(base.unitPrice ?? item.unitPrice ?? 0);
  const total = Number(base.total ?? qty * unitPrice);

  return {
    ...item,

    priceInfo: {
      ...defaultPriceInfo(),
      ...base,
      qty,
      unitPrice,
      total,
      unitType: base.unitType ?? item.unitType ?? "u",
      promo: base.promo ?? "none",
      summary: base.summary ?? null,
    },

    qty,
    unitPrice,
    total,
  };
}

function normalizeStore(store) {
  if (!store) return null;
  if (typeof store === "string") return store;
  if (store?.name) return store.name;
  return null;
}

// -----------------------------------------
// Provider
// -----------------------------------------
export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [config, setConfig] = useState({
    search: {
      generalEngine: "google",
      bookEngine: "googleBooks",
    },
  });

  // -----------------------------------------
  // Cargar configuración
  // -----------------------------------------
  useEffect(() => {
    load("@expo-shop/config", null).then((stored) => {
      if (stored) setConfig(stored);
    });
  }, []);

  useEffect(() => {
    save("@expo-shop/config", config);
  }, [config]);

  const setGeneralEngine = (engine) =>
    setConfig((p) => ({
      ...p,
      search: { ...p.search, generalEngine: engine },
    }));

  const setBookEngine = (engine) =>
    setConfig((p) => ({
      ...p,
      search: { ...p.search, bookEngine: engine },
    }));

  // -----------------------------------------
  // CARGA INICIAL
  // -----------------------------------------
  const reload = async () => {
    const loadedLists = await load("lists", []);
    const normalizedLists = loadedLists.map((l) => ({
      ...l,
      items: (l.items || []).map(normalizeItem),
    }));
    setLists(normalizedLists);

    const hist = await load("purchaseHistory", []);
    setPurchaseHistory(hist.map(normalizeItem));
  };

  useEffect(() => {
    reload();
  }, []);

  // -----------------------------------------
  // CRUD LISTAS
  // -----------------------------------------
  const addList = async (newList) => {
    const updated = [newList, ...lists];
    setLists(updated);
    await save("lists", updated);
  };

  const updateListData = async (id, updater) => {
    const updated = lists.map((l) => (l.id === id ? updater(l) : l));
    setLists(updated);
    await save("lists", updated);
    return updated.find((l) => l.id === id);
  };

  const deleteList = async (id) => {
    const updated = lists.filter((l) => l.id !== id);
    setLists(updated);
    await save("lists", updated);
  };

  const archiveList = async (id) => {
    const target = lists.find((l) => l.id === id);
    if (!target) return;

    const purchasedAt = new Date().toISOString();
    const storeName = normalizeStore(target.store);

    // -----------------------------------------------------
    // 1) Crear entradas del historial con todos los campos
    // -----------------------------------------------------
    const newEntries = (target.items || []).map((rawItem) => {
      const item = normalizeItem(rawItem); // asegura priceInfo coherente

      return {
        ...item,
        listName: target.name,
        store: storeName,
        purchasedAt,
      };
    });

    // -----------------------------------------------------
    // 2) Guardar en purchaseHistory sin perder lo existente
    // -----------------------------------------------------
    const updatedHistory = [...purchaseHistory, ...newEntries];
    setPurchaseHistory(updatedHistory);
    await save("purchaseHistory", updatedHistory);

    // -----------------------------------------------------
    // 3) Marcar lista como archivada y normalizar sus items
    // -----------------------------------------------------
    const updatedLists = lists.map((l) =>
      l.id === id
        ? {
            ...l,
            archived: true,
            archivedAt: purchasedAt,
            store: storeName,
            items: (l.items || []).map((it) => normalizeItem(it)),
          }
        : l
    );

    setLists(updatedLists);
    await save("lists", updatedLists);
  };

  // -----------------------------------------
  // Historial
  // -----------------------------------------
  const addItemsToHistory = async (items) => {
    const stamped = items.map((i) =>
      normalizeItem({
        ...i,
        purchasedAt: new Date().toISOString(),
      })
    );

    const updated = [...purchaseHistory, ...stamped];
    setPurchaseHistory(updated);
    await save("purchaseHistory", updated);
  };

  const clearPurchaseHistory = async () => {
    setPurchaseHistory([]);
    await save("purchaseHistory", []);
  };

  // -----------------------------------------
  // Derivados
  // -----------------------------------------
  const activeLists = lists.filter((l) => !l.archived);
  const archivedLists = lists.filter((l) => l.archived);

  // -----------------------------------------
  // Exponer API
  // -----------------------------------------
  return (
    <StoreContext.Provider
      value={{
        // datos
        lists,
        activeLists,
        archivedLists,
        purchaseHistory,

        // acciones
        reload,
        addList,
        updateListData,
        deleteList,
        archiveList,
        addItemsToHistory,
        clearPurchaseHistory,

        // config
        config,
        setGeneralEngine,
        setBookEngine,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
