// utils/safeAlert.js
import { Alert, Platform } from "react-native";

/**
 * safeAlert(title, message)
 * Muestra un alert compatible con Expo Web o dispositivos.
 */
export function safeAlert(title, message) {
  if (Platform.OS === "web") {
    // En modo Web → mostramos en consola y ventana nativa
    // console.log(`⚠️ ${title}: ${message}`);
    if (typeof window !== "undefined" && window.alert) {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // En móvil → Alert clásico
    Alert.alert(title, message);
  }
}

/**
 * safeConfirm(title, message, onConfirm)
 * Versión confirmable (para eliminar, etc.)
 */
export function safeConfirm(title, message, onConfirm) {
  if (Platform.OS === "web") {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed && typeof onConfirm === "function") onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Aceptar", onPress: onConfirm },
    ]);
  }
}
