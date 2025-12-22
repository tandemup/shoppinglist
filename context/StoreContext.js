import React, { createContext, useContext, useState } from "react";
import storesData from "../data/stores.json";

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [stores] = useState(storesData);
  const [selectedStore, setSelectedStore] = useState(null);

  return (
    <StoreContext.Provider
      value={{
        stores,
        selectedStore,
        setSelectedStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export default StoreContext;
