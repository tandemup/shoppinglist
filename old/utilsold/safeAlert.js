import { Alert, Platform } from "react-native";

/**
 * Alerta segura multiplataforma
 * - Mobile: Alert.alert
 * - Web: window.confirm
 */
export function safeAlert(title, message, buttons = []) {
  // comportamiento por defecto
  const cancelBtn = buttons.find((b) => b.style === "cancel") ?? null;

  const confirmBtn = buttons.find((b) => b.style !== "cancel") ?? null;

  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      title ? `${title}\n\n${message}` : message
    );

    if (confirmed) {
      confirmBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }

  Alert.alert(
    title,
    message,
    buttons.length ? buttons : [{ text: "OK", onPress: () => {} }]
  );
}
