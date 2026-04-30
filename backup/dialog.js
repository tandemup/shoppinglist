let showDialog = null;

export function registerDialog(fn) {
  showDialog = fn;
}

function ensure() {
  if (!showDialog) {
    throw new Error("DialogProvider not mounted");
  }
}

export function alert(title, message) {
  ensure();
  return showDialog({
    type: "alert",
    title,
    message,
    buttons: [{ text: "OK" }],
  });
}

export function confirm(title, message, buttons) {
  ensure();
  return showDialog({
    type: "confirm",
    title,
    message,
    buttons:
      buttons ?? [
        { text: "Cancel", style: "cancel" },
        { text: "OK" },
      ],
  });
}

export function actionSheet(title, buttons) {
  ensure();
  return showDialog({
    type: "actionSheet",
    title,
    buttons,
  });
}
