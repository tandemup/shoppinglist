// utils/defaultItem.js
export const defaultItem = {
  id: "",
  name: "",
  checked: true,
  date: new Date().toISOString().split("T")[0],
  store: "",
  category: "",
  barcode: "",
  
  priceInfo: {
    unitPrice: 0,
    qty: 1,
    promo: "none",
    unitType: "u", 
    total: 0,
    summary: ""
  }
};
