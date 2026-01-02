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
