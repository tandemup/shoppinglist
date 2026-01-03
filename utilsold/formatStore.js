// utils/formatStore.js
export const formatStore = (store) => {
  if (!store) return "";

  // Si ya es string → usar tal cual
  if (typeof store === "string") return store;

  // Si es objeto de mapas u objeto no imprimible
  if (
    store.icon !== undefined ||
    store.zone !== undefined ||
    store.radius !== undefined ||
    store.color !== undefined
  ) {
    return "";
  }

  // SIEMPRE devolver solo el nombre
  if (store.name && typeof store.name === "string") return store.name;

  return "";
};
