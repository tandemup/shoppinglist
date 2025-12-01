import AsyncStorage from "@react-native-async-storage/async-storage";

//
// 🔑 CLAVE OFICIAL DEL PROYECTO
//
const SCANNED_KEY = "@expo-shop/scanned-history";

//
// 📌 Cargar historial completo
//
export const getScannedHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(SCANNED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.log("❌ Error reading scanned history:", err);
    return [];
  }
};

//
// 📌 Guardar un nuevo escaneo
//    - Evita duplicados
//    - Incrementa scanCount
//    - Siempre usa BARCODE como ID real
//
export const addScannedProductFull = async (item) => {
  try {
    const all = await getScannedHistory();
    const code = item.barcode ?? item.code ?? null;

    if (!code) {
      console.log("❌ No barcode found in scanned item");
      return null;
    }

    const existing = all.find((i) => i.barcode === code);
    let newItem;

    if (existing) {
      // 🔁 Ya existe → actualizar y sumar contador
      newItem = {
        ...existing,
        name: item.name ?? existing.name,
        brand: item.brand ?? existing.brand,
        image: item.image ?? existing.image,
        url: item.url ?? existing.url,
        isBook: item.isBook ?? existing.isBook,
        scannedAt: new Date().toISOString(),
        scanCount: (existing.scanCount ?? 1) + 1,
      };

      const filtered = all.filter((i) => i.barcode !== code);
      const updated = [newItem, ...filtered];

      await AsyncStorage.setItem(SCANNED_KEY, JSON.stringify(updated));
      return newItem;
    }

    // 🆕 Nuevo producto escaneado
    newItem = {
      id: Date.now().toString(), // ID opcional, ya no se usa como clave
      barcode: code,
      name: item.name ?? "Producto",
      brand: item.brand ?? "",
      image: item.image ?? null,
      url: item.url ?? null,
      isBook: item.isBook ?? false,
      scannedAt: new Date().toISOString(),
      source: "scanner",
      scanCount: 1,
    };

    const updated = [newItem, ...all];
    await AsyncStorage.setItem(SCANNED_KEY, JSON.stringify(updated));
    return newItem;
  } catch (err) {
    console.log("❌ Error saving scanned product:", err);
  }
};

//
// ✏️ Actualizar un item por BARCODE
//
export const updateScannedEntry = async (barcode, updates) => {
  try {
    const all = await getScannedHistory();

    const updatedList = all.map((item) => {
      if (item.barcode === barcode) {
        return {
          ...item,
          ...updates,
        };
      }
      return item;
    });

    await AsyncStorage.setItem(SCANNED_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.log("❌ Error updating scanned entry:", err);
  }
};

//
// 🗑 Eliminar un SOLO item usando barcode (CORREGIDO)
//
export const removeScannedItem = async (barcode) => {
  try {
    const all = await getScannedHistory();

    // ⭐ Ahora se borra por BARCODE, no por id
    const filtered = all.filter((item) => item.barcode !== barcode);

    await AsyncStorage.setItem(SCANNED_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.log("❌ Error deleting scanned item:", err);
  }
};

//
// 🚨 Borrar TODO el historial
//
export const clearScannedHistory = async () => {
  try {
    await AsyncStorage.setItem(SCANNED_KEY, JSON.stringify([]));
  } catch (err) {
    console.log("❌ Error clearing scanned history:", err);
  }
};
