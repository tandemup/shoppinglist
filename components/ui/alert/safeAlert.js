import { Alert, Platform } from "react-native";

let webAlertListener = null;

export function registerWebAlertListener(listener) {
  webAlertListener = listener;

  return () => {
    if (webAlertListener === listener) {
      webAlertListener = null;
    }
  };
}

function normalizeButtons(buttons = []) {
  return buttons.filter(Boolean).map((b, index) => ({
    key: b.key ?? `btn-${index}`,
    text: b.text ?? b.label ?? "",
    style: b.style ?? "default",
    onPress: typeof b.onPress === "function" ? b.onPress : undefined,
  }));
}

function safeAlertWebModal(title, message, buttons) {
  const normalized = normalizeButtons(buttons);

  if (typeof webAlertListener === "function") {
    webAlertListener({
      visible: true,
      title: title ?? "",
      message: message ?? "",
      buttons:
        normalized.length > 0
          ? normalized
          : [{ key: "ok", text: "Aceptar", style: "default" }],
    });
    return true;
  }

  return false;
}

function safeAlertWeb(title, message, buttons) {
  const handledByModal = safeAlertWebModal(title, message, buttons);
  if (handledByModal) return;

  if (!buttons || buttons.length === 0) {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  if (buttons.length === 1) {
    window.alert(`${title}\n\n${message}`);
    buttons[0]?.onPress?.();
    return;
  }

  if (buttons.length >= 2) {
    const confirmResult = window.confirm(`${title}\n\n${message}`);
    if (confirmResult) {
      const positive = buttons.find((b) => b?.style !== "cancel") ?? buttons[1];
      positive?.onPress?.();
    }
  }
}

export function safeAlert(title, message, buttons) {
  if (Platform.OS === "web") {
    safeAlertWeb(title, message, buttons);
    return;
  }

  const normalized = normalizeButtons(buttons);

  if (normalized.length === 0) {
    Alert.alert(title, message);
    return;
  }

  Alert.alert(title, message, normalized);
}

export function safeConfirm(title, message, onConfirm) {
  safeAlert(title, message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Aceptar", onPress: onConfirm },
  ]);
}
