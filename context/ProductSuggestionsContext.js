import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useLists } from "./ListsContext";
import { usePurchases } from "./PurchasesContext";
import { useProductLearning } from "./ProductLearningContext";

const ProductSuggestionsContext = createContext(null);

/* -------------------------------------------------
   Helpers
-------------------------------------------------- */

// Paso 10 — score por recencia
const getRecencyScore = (lastDate) => {
  if (!lastDate) return 0;

  const days =
    (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);

  if (days <= 7) return 5;
  if (days <= 30) return 3;
  if (days <= 90) return 1;
  return 0;
};

// Paso 12 — aprendizaje ligero
const getLearningBoost = (name, learning) => {
  const data = learning?.[name.toLowerCase()];
  if (!data) return 0;

  if (data.selects >= 10) return 5;
  if (data.selects >= 5) return 3;
  if (data.selects >= 2) return 1;
  return 0;
};

/* -------------------------------------------------
   Provider
-------------------------------------------------- */
export function ProductSuggestionsProvider({ children }) {
  const { activeLists } = useLists();
  const { purchases = [] } = usePurchases();
  const { learning } = useProductLearning();

  /* ---------------------------
     State
  ----------------------------*/
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState(null);

  /* ---------------------------
     Debounce (Paso 11)
  ----------------------------*/
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  /* ---------------------------
     Cache por sesión (Paso 11)
  ----------------------------*/
  const cacheRef = useRef(new Map());

  /* -------------------------------------------------
     API de búsqueda
  -------------------------------------------------- */
  const search = (text) => {
    setQuery(text);
  };

  /* -------------------------------------------------
     Suggestions (Paso 10 + 11 + 12)
  -------------------------------------------------- */
  const suggestions = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];

    if (cacheRef.current.has(q)) {
      return cacheRef.current.get(q);
    }

    const resultsMap = new Map();

    /* ---------------------------
       1️⃣ Histórico de compras
    ----------------------------*/
    purchases.forEach((item) => {
      if (!item.productName?.toLowerCase().includes(q)) return;
      if (storeFilter && item.store !== storeFilter) return;

      const frequency = purchases.filter(
        (p) => p.productName === item.productName
      ).length;

      const recencyScore = getRecencyScore(item.date);
      const learningBoost = getLearningBoost(item.productName, learning);

      const score = frequency * 3 + recencyScore * 5 + learningBoost * 4;

      const id = `hist-${item.productName}`;
      const existing = resultsMap.get(id);

      if (!existing || existing.score < score) {
        resultsMap.set(id, {
          id,
          type: "history",
          name: item.productName,
          unitPrice: item.unitPrice ?? null,
          unitLabel: item.unit ?? "",
          priceInfo: item.priceInfo ?? null,
          listName: item.listName,
          frequency,
          recencyScore,
          score,
        });
      }
    });

    /* ---------------------------
       2️⃣ Items en listas activas
    ----------------------------*/
    activeLists.forEach((list) => {
      list.items.forEach((item) => {
        if (!item.name?.toLowerCase().includes(q)) return;

        const id = `cur-${item.name}`;
        if (resultsMap.has(id)) return;

        resultsMap.set(id, {
          id,
          type: "current",
          name: item.name,
          unitPrice: item.priceInfo?.unitPrice ?? null,
          unitLabel: item.priceInfo?.unitLabel ?? "",
          priceInfo: item.priceInfo ?? null,
          frequency: 0,
          recencyScore: 0,
          score: 1,
        });
      });
    });

    /* ---------------------------
       3️⃣ Crear nuevo (Paso 11)
    ----------------------------*/
    const hasExactMatch = Array.from(resultsMap.values()).some(
      (r) => r.name.toLowerCase() === q
    );

    if (!hasExactMatch) {
      resultsMap.set(`create-${q}`, {
        id: `create-${q}`,
        type: "create",
        name: debouncedQuery.trim(),
        score: Infinity,
      });
    }

    /* ---------------------------
       4️⃣ Orden final
    ----------------------------*/
    const results = Array.from(resultsMap.values()).sort(
      (a, b) => b.score - a.score
    );

    cacheRef.current.set(q, results);
    return results;
  }, [debouncedQuery, purchases, activeLists, storeFilter, learning]);

  /* -------------------------------------------------
     API pública
  -------------------------------------------------- */
  const clear = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <ProductSuggestionsContext.Provider
      value={{
        query,
        search,
        suggestions,
        storeFilter,
        setStoreFilter,
        clear,
      }}
    >
      {children}
    </ProductSuggestionsContext.Provider>
  );
}

/* -------------------------------------------------
   Hook
-------------------------------------------------- */
export function useProductSuggestions() {
  const ctx = useContext(ProductSuggestionsContext);
  if (!ctx) {
    throw new Error(
      "useProductSuggestions must be used inside ProductSuggestionsProvider"
    );
  }
  return ctx;
}
