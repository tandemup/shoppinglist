import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FabMenu({
  actions = [],
  bottom = 24,
  right = 20,
  mainColor = "#16a34a",
}) {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => {
    setOpen((prev) => !prev);
  };

  const handleActionPress = (action) => {
    setOpen(false);
    if (typeof action.onPress === "function") {
      action.onPress();
    }
  };

  return (
    <>
      {open && (
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
      )}

      <View style={[styles.container, { bottom, right }]}>
        {open && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <View key={action.key || String(index)} style={styles.actionRow}>
                <View style={styles.labelBubble}>
                  <Text style={styles.labelText}>{action.label}</Text>
                </View>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleActionPress(action)}
                  hitSlop={10}
                >
                  <Ionicons name={action.icon} size={20} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={[styles.fab, { backgroundColor: mainColor }]}
          onPress={toggleMenu}
          hitSlop={10}
        >
          <Ionicons name={open ? "close" : "add"} size={28} color="#fff" />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },

  container: {
    position: "absolute",
    alignItems: "flex-end",
    zIndex: 999,
  },

  actionsContainer: {
    marginBottom: 12,
    alignItems: "flex-end",
    gap: 10,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  labelBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
