import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  useWindowDimensions,
} from "react-native";

export default function ContextMenu({
  visible,
  anchorRef,
  items = [],
  onClose,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [position, setPosition] = useState({ x: 8, y: 8 });

  useEffect(() => {
    if (!visible) return;

    const measureAnchor = () => {
      if (!anchorRef?.current?.measureInWindow) return;

      anchorRef.current.measureInWindow((x, y, width, height) => {
        const menuWidth = 180;
        const estimatedMenuHeight = Math.max(48, items.length * 44 + 12);

        let nextX = x + width - menuWidth;
        let nextY = y + height + 6;

        if (nextX < 8) nextX = 8;
        if (nextX + menuWidth > windowWidth - 8) {
          nextX = Math.max(8, windowWidth - menuWidth - 8);
        }

        if (nextY + estimatedMenuHeight > windowHeight - 8) {
          nextY = Math.max(8, y - estimatedMenuHeight - 6);
        }

        setPosition({ x: nextX, y: nextY });
      });
    };

    measureAnchor();

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
  }, [
    visible,
    anchorRef,
    items.length,
    opacity,
    translateY,
    windowWidth,
    windowHeight,
  ]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
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
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              android_ripple={{ color: "#e5e7eb" }}
              onPress={() => {
                onClose?.();
                requestAnimationFrame(() => {
                  item.onPress?.();
                });
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
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  itemPressed: {
    backgroundColor: "#f3f4f6",
  },
  text: {
    fontSize: 15,
    color: "#111",
  },
  destructiveText: {
    color: "#dc2626",
  },
});
