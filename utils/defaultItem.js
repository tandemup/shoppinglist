// utils/defaultItem.js
export function defaultPriceInfo() {
  return {
    unitPrice: 0,
    qty: 1,
    unitType: "u", // 👈 unidad por defecto
    promo: "none",
    summary: "",
    total: 0,
  };
}
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
