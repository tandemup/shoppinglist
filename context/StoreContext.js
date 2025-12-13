// StoreContext.js — versión optimizada y coherente 2025
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultPriceInfo } from "../utils/defaultItem";
import { ItemFactory } from "../utils/ItemFactory";

const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);

//
// ────────────────────────────────────────────────────────────────
//  Storage helpers
// ────────────────────────────────────────────────────────────────
//
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

//
// ────────────────────────────────────────────────────────────────
//  Normalización de items
// ────────────────────────────────────────────────────────────────
//
function normalizeItem(item) {
  if (!item) return null;

  const base = item.priceInfo ?? {};

  const qty = Number(base.qty ?? 1);
  const unitPrice = Number(base.unitPrice ?? 0);
  const total = Number(base.total ?? qty * unitPrice);

  return {
    ...item,

    // PriceInfo garantizado
    priceInfo: {
      ...defaultPriceInfo(),
      ...base,
      qty,
      unitPrice,
      total,
      unitType: base.unitType ?? "u",
      promo: base.promo ?? "none",
      summary: base.summary ?? null,
      warning: base.warning ?? null,
    },
  };
}

function normalizeStore(store) {
  if (!store) return null;
  if (typeof store === "string") return store;
  if (store?.name) return store.name;
  return null;
}

//
// ────────────────────────────────────────────────────────────────
//  Provider
// ────────────────────────────────────────────────────────────────
//
export function StoreProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  //
  // LOAD
  //
  const reload = async () => {
    const loadedLists = await load("lists", []);
    setLists(
      loadedLists.map((l) => ({
        ...l,
        items: (l.items ?? []).map(normalizeItem),
      }))
    );

    const hist = await load("purchaseHistory", []);
    setPurchaseHistory(hist.map(normalizeItem));
  };

  useEffect(() => {
    reload();
  }, []);

  //
  // ────────────────────────────────────────────────
  // CRUD LISTAS
  // ────────────────────────────────────────────────
  //
  const addList = async (newList) => {
    const updated = [newList, ...lists];
    setLists(updated);
    await save("lists", updated);
  };

  const updateListData = async (id, updater) => {
    let updatedList = null;

    setLists((prev) => {
      const updated = prev.map((l) => {
        if (l.id === id) {
          updatedList = updater(l);
          return updatedList;
        }
        return l;
      });

      save("lists", updated);
      return updated;
    });

    return updatedList;
  };

  const deleteList = async (id) => {
    const updated = lists.filter((l) => l.id !== id);
    setLists(updated);
    await save("lists", updated);
  };

  //
  // ARCHIVAR LISTA
  //
  const archiveList = async (id) => {
    const target = lists.find((l) => l.id === id);
    if (!target) return;

    const purchasedAt = new Date().toISOString();
    const storeName = normalizeStore(target.store);

    //
    // 🔥 Filtrar solo los comprados
    //
    const purchasedItems = (target.items ?? [])
      .filter((raw) => raw.checked)
      .map((raw) => normalizeItem(raw));

    //
    // 1️⃣ Añadir al historial SOLO los comprados
    //
    const newEntries = purchasedItems.map((item) => ({
      ...item,
      listName: target.name,
      store: storeName,
      purchasedAt,
    }));

    const updatedHistory = [...purchaseHistory, ...newEntries];
    setPurchaseHistory(updatedHistory);
    await save("purchaseHistory", updatedHistory);

    //
    // 2️⃣ Actualizar la lista archivada dejando SOLO items comprados
    //
    const updatedLists = lists.map((l) =>
      l.id === id
        ? {
            ...l,
            archived: true,
            archivedAt: purchasedAt,
            store: storeName,
            items: purchasedItems, // 👈 FILTRO APLICADO AQUÍ
          }
        : l
    );

    setLists(updatedLists);
    await save("lists", updatedLists);
  };

  //
  // HISTORIAL EXTRA
  //
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

  //
  // ────────────────────────────────────────────────
  // ITEM HELPERS (OPTIMIZADOS)
  // ────────────────────────────────────────────────
  //
  const getItemById = (listId, itemId) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return null;
    return list.items.find((i) => i.id === itemId) ?? null;
  };

  const updateItem = async (listId, itemId, patch) => {
    return updateListData(listId, (base) => ({
      ...base,
      items: base.items.map((i) => {
        if (i.id !== itemId) return i;

        const merged = { ...i, ...patch };

        // Mantener checked si no viene en patch
        if (typeof patch.checked !== "boolean") {
          merged.checked = i.checked;
        }

        return ItemFactory.normalize(merged);
      }),
    }));
  };

  //
  // DERIVADOS
  //
  const activeLists = lists.filter((l) => !l.archived);
  const archivedLists = lists.filter((l) => l.archived);

  //
  // EXPOSE API
  //
  return (
    <StoreContext.Provider
      value={{
        lists,
        activeLists,
        archivedLists,
        purchaseHistory,

        reload,
        addList,
        updateListData,
        deleteList,
        archiveList,
        addItemsToHistory,
        clearPurchaseHistory,

        getItemById,
        updateItem,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
