import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  UIManager,
  findNodeHandle,
  Modal,
} from "react-native";

export default function ContextMenu({
  visible,
  anchorRef,
  items = [],
  onClose,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (visible && anchorRef?.current) {
      if (Platform.OS === "web") {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          x: rect.right - 180,
          y: rect.bottom + 6,
        });
      } else {
        const node = findNodeHandle(anchorRef.current);

        if (node) {
          UIManager.measureInWindow(node, (x, y, width, height) => {
            setPosition({
              x: x + width - 180,
              y: y + height + 6,
            });
          });
        }
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

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
              key={idx}
              style={styles.item}
              onPress={() => {
                onClose();
                item.onPress?.();
              }}
            >
              <Text
                style={[styles.text, item.destructive && { color: "#dc2626" }]}
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

    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

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
});
