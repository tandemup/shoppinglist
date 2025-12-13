// utils/defaultItem.js
export const defaultPriceInfo = () => ({
  unitType: "u", // u | kg | l
  qty: 1,
  unitPrice: 0,
  promo: "none",
  total: 0,
  summary: "",
  warning: null,
});

export const defaultItem = {
  id: "",
  name: "",
  brand: "",
  barcode: "",
  image: null,
  checked: true,
  priceInfo: defaultPriceInfo(),
};

export const defaultItem1 = {
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
