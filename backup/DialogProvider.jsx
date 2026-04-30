import React, { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import ActionSheetModal from "../actionsheet/ActionSheetModal";
import WebAlertModal from "../alert/WebAlertModal";
import { registerDialog } from "./dialog";
import DialogModal from "./DialogModal";

export default function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);

  useEffect(() => {
    registerDialog((options) => {
      if (Platform.OS !== "web" && options.type !== "actionSheet") {
        return nativeAlert(options);
      }

      setDialog(options);

      return new Promise((resolve) => {
        resolverRef.current = resolve;
      });
    });
  }, []);

  const close = (value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  };

  return (
    <>
      {children}

      {Platform.OS === "web" && dialog?.type !== "actionSheet" && (
        <WebAlertModal dialog={dialog} onSelect={(i) => close(i)} />
      )}

      {Platform.OS !== "web" && dialog?.type !== "actionSheet" && (
        <DialogModal dialog={dialog} onSelect={(i) => close(i)} />
      )}

      {dialog?.type === "actionSheet" && (
        <ActionSheetModal dialog={dialog} onSelect={(i) => close(i)} />
      )}
    </>
  );
}

function nativeAlert(options) {
  return new Promise((resolve) => {
    const buttons =
      options.buttons?.map((b, index) => ({
        text: b.text,
        style: b.style,
        onPress: () => resolve(index),
      })) ?? [{ text: "OK", onPress: () => resolve(0) }];

    Alert.alert(options.title ?? "", options.message ?? "", buttons);
  });
}
