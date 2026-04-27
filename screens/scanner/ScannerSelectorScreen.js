import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";

// import ScannerQuickMode from "./ScannerQuickMode";
// import ScannerDetailMode from "./ScannerDetailMode";

export default function ScannerSelectorScreen({ navigation, route }) {
  const initialMode = route?.params?.initialMode ?? "quick";
  const [mode, setMode] = useState(initialMode);

  const sharedProps = useMemo(
    () => ({
      navigation,
      route,
      embedded: true,
    }),
    [navigation, route],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleWrap}>
        <Pressable
          onPress={() => setMode("quick")}
          style={[
            styles.toggleButton,
            mode === "quick" && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "quick" && styles.toggleTextActive,
            ]}
          >
            Rápido
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode("detail")}
          style={[
            styles.toggleButton,
            mode === "detail" && styles.toggleButtonActive,
          ]}
        >
          <Text
            style={[
              styles.toggleText,
              mode === "detail" && styles.toggleTextActive,
            ]}
          >
            Detalle
          </Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {mode === "quick" ? (
          <ScannerQuickMode {...sharedProps} />
        ) : (
          <ScannerDetailMode {...sharedProps} />
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
  toggleWrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: "#2563eb",
  },
  toggleText: {
    color: "#9ca3af",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
});
