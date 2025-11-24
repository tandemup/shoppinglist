// utils/defaultItem.js

export const defaultItem = {
  name: "",
  checked: false,
  date: null, // Puedes cambiarlo a Date.now() si deseas tracking automático
  priceInfo: {
    unitType: "u",
    unitPrice: 0,
    qty: 1,
    promo: "none",
    total: 0,
    summary: "",
  },
};
