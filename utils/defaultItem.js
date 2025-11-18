// utils/defaultItem.js

// Este objeto define la estructura inicial de un item NUEVO.
// No incluye "id" porque eso se genera con uuidv4().
// Todos los valores aquí deben ser seguros y no sobrescribir
// datos reales cuando hacemos: { ...defaultItem, ...item }.

export const defaultItem = {
  name: "",
  checked: false,
  date: null,

  // PriceInfo debe existir siempre como objeto completo
  priceInfo: {
    unitType: "u",
    unitPrice: 0,
    qty: 1,
    promo: "none",
    total: 0,
    summary: "",
  },
};
