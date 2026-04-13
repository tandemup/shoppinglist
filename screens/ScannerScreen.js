import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";
import ScannerQuickMode from "./ScannerQuickMode";
import ScannerDetailMode from "./ScannerDetailMode";

export default function ScannerScreen({ navigation, route }) {
  const [mode, setMode] = useState("detail");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.selectorWrap}>
        <Pressable
          style={[
            styles.selectorButton,
            mode === "detail" && styles.selectorButtonActive,
          ]}
          onPress={() => setMode("detail")}
        >
          <Text
            style={[
              styles.selectorText,
              mode === "detail" && styles.selectorTextActive,
            ]}
          >
            Detalle
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.selectorButton,
            mode === "quick" && styles.selectorButtonActive,
          ]}
          onPress={() => setMode("quick")}
        >
          <Text
            style={[
              styles.selectorText,
              mode === "quick" && styles.selectorTextActive,
            ]}
          >
            Rápido
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {mode === "detail" ? (
          <ScannerDetailMode navigation={navigation} route={route} />
        ) : (
          <ScannerQuickMode navigation={navigation} route={route} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  selectorWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  selectorButtonActive: {
    backgroundColor: "#2563eb",
  },
  selectorText: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  selectorTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
});
