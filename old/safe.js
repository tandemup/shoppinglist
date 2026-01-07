// utils/safeAlert.js
import { Alert, Platform } from "react-native";

/**
 * safeAlert(title, message, buttons?)
 * Compatible con:
 *  - safeAlert("Error", "Texto")  ← funciona igual que antes
 *  - safeAlert("Eliminar", "¿Seguro?", [ ... ]) ← ahora soportado
 */
export function safeAlert(title, message, buttons) {
  // --- WEB ---
  if (Platform.OS === "web") {
    if (!buttons) {
      // Comportamiento antiguo → no rompemos nada
      if (typeof window !== "undefined" && window.alert) {
        window.alert(`${title}\n\n${message}`);
      }
      return;
    }

    // Botones personalizados en web usando confirm()
    if (buttons.length === 1) {
      // Un solo botón → window.alert
      window.alert(`${title}\n\n${message}`);
      const b = buttons[0];
      if (b.onPress) b.onPress();
      return;
    }

    if (buttons.length >= 2) {
      // Simulación de Cancelar / Aceptar
      const confirmResult = window.confirm(`${title}\n\n${message}`);
      if (confirmResult) {
        const positive = buttons[1];
        if (positive?.onPress) positive.onPress();
      }
      return;
    }
  }

  // --- MOBILE ---
  if (!buttons) {
    // Comportamiento antiguo → no modificamos nada
    Alert.alert(title, message);
  } else {
    // Nueva función con botones personalizados
    Alert.alert(title, message, buttons);
  }
}

/**
 * safeConfirm(title, message, onConfirm)
 * Confirm tradicional con 2 botones
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
