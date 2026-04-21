import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import WebAlertModal from "./WebAlertModal";
import { registerWebAlertListener } from "./safeAlert";

export default function WebAlertHost() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const unsubscribe = registerWebAlertListener((payload) => {
      setDialog(payload);
    });

    return unsubscribe;
  }, []);

  if (Platform.OS !== "web") return null;

  const close = () => {
    setDialog(null);
  };

  const handleSelect = (index) => {
    const button = dialog?.buttons?.[index];
    close();

    requestAnimationFrame(() => {
      button?.onPress?.();
    });
  };

  return (
    <WebAlertModal dialog={dialog} onClose={close} onSelect={handleSelect} />
  );
}
