import AsyncStorage from "@react-native-async-storage/async-storage";

async function getString(key, fallback = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ?? fallback;
  } catch (error) {
    console.warn(`[storage] getString failed for key "${key}"`, error);
    return fallback;
  }
}

async function setString(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[storage] setString failed for key "${key}"`, error);
    return false;
  }
}

async function getJSON(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (raw == null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] getJSON failed for key "${key}"`, error);
    return fallback;
  }
}

async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] setJSON failed for key "${key}"`, error);
    return false;
  }
}

async function remove(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`[storage] remove failed for key "${key}"`, error);
    return false;
  }
}

async function mergeJSON(key, partialValue) {
  try {
    const current = await getJSON(key, {});

    const nextValue = {
      ...(current && typeof current === "object" && !Array.isArray(current)
        ? current
        : {}),
      ...(partialValue &&
      typeof partialValue === "object" &&
      !Array.isArray(partialValue)
        ? partialValue
        : {}),
    };

    await setJSON(key, nextValue);
    return nextValue;
  } catch (error) {
    console.warn(`[storage] mergeJSON failed for key "${key}"`, error);
    return null;
  }
}

export const asyncStorageClient = {
  getString,
  setString,
  getJSON,
  setJSON,
  remove,
  mergeJSON,
};
