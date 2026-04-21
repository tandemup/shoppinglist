import React, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export default function FabRadialMenu({
  actions = [],
  mainIcon = "add",
  closeIcon = "close",
}) {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const toggleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.spring(animation, {
      toValue: open ? 0 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

    setOpen((prev) => !prev);
  };

  const handleActionPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleMenu();
    action?.onPress?.();
  };

  return (
    <>
      {open && <Pressable style={styles.overlay} onPress={toggleMenu} />}

      <View style={[styles.container, { bottom: 20 + insets.bottom }]}>
        {actions.map((action, index) => {
          const startAngle = (-80 * Math.PI) / 180;
          const endAngle = (-170 * Math.PI) / 180;

          const angle =
            actions.length === 1
              ? startAngle
              : startAngle +
                (index * (endAngle - startAngle)) / (actions.length - 1);

          const itemRadius = 92 + index * 12;

          const translateX = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, itemRadius * Math.cos(angle)],
          });

          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, itemRadius * Math.sin(angle)],
          });

          const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1],
          });

          const opacity = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View
              key={action.key || action.label || String(index)}
              style={[
                styles.action,
                {
                  opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
              >
                <Ionicons name={action.icon} size={22} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <TouchableOpacity style={styles.fab} onPress={toggleMenu}>
          <Ionicons name={open ? closeIcon : mainIcon} size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    zIndex: 999,
    elevation: 999,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  action: {
    position: "absolute",
  },

  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
});
