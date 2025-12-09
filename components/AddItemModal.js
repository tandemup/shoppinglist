// components/AddItemModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import SearchBarBasic from "./SearchBarBasic";

export default function AddItemModal({
  visible,
  onClose,
  onCreateItem,
  onSelectSuggestion,
  suggestions = [],
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (visible) setQuery("");
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      {/* Fondo semitransparente */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      />

      {/* Contenedor inferior tipo sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.sheet}>
          <SearchBarBasic
            placeholder="Añadir producto..."
            onTextChange={setQuery}
            suggestions={suggestions}
            onSelectSuggestion={(item) => {
              onSelectSuggestion(item);
              onClose();
            }}
            onSubmit={() => {
              if (!query.trim()) return;
              const newItem = onCreateItem(query.trim());
              onClose();
              // Si quieres abrir ItemDetailScreen al crear el item:
              // navigation.navigate("ItemDetailScreen", { item: newItem });
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  sheet: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { height: -2 },
  },
});
