import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  Modal,
} from "react-native";
import { safeAlert } from "../../utils/core/safeAlert";

export default function ContextMenu({
  visible,
  anchorRef,
  title = "Opciones",
  message = "",
  items = [],
  onClose,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!visible) return;

    // ---------- MOBILE (iOS / Android) ----------
    if (Platform.OS !== "web") {
      const alertButtons = [
        ...items.map((item) => ({
          text: item.label,
          style: item.destructive ? "destructive" : "default",
          onPress: item.onPress,
        })),
        {
          text: "Cancelar",
          style: "cancel",
        },
      ];

      safeAlert(title, message, alertButtons);

      // cerrar estado después de abrir alert
      setTimeout(() => {
        onClose?.();
      }, 0);

      return;
    }

    // ---------- WEB ----------
    if (anchorRef?.current?.getBoundingClientRect) {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const viewportWidth = window.innerWidth;

      let x = rect.right - menuWidth;

      if (x < 8) x = 8;
      if (x + menuWidth > viewportWidth - 8) {
        x = viewportWidth - menuWidth - 8;
      }

      setPosition({
        x,
        y: rect.bottom + 6,
      });
    }

    opacity.setValue(0);
    translateY.setValue(-8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  if (!visible || Platform.OS !== "web") return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.menu,
            {
              top: position.y,
              left: position.x,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          {items.map((item, idx) => (
            <Pressable
              key={`${item.label}-${idx}`}
              style={styles.item}
              onPress={() => {
                onClose?.();
                item.onPress?.();
              }}
            >
              <Text
                style={[
                  styles.text,
                  item.destructive && styles.destructiveText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,

    ...(Platform.OS === "web" && {
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    }),
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  text: {
    fontSize: 15,
    color: "#111",
  },
  destructiveText: {
    color: "#dc2626",
  },
});
