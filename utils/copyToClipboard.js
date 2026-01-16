// utils/copyToClipboard.js
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

export async function copyToClipboard(text) {
  try {
    if (Platform.OS === "web") {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    }

    await Clipboard.setStringAsync(text);
    return true;
  } catch (err) {
    console.warn("Clipboard error", err);
    return false;
  }
}
