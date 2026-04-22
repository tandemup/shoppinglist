// screens/EditScannedItemScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import {
  updateScannedEntry,
  removeScannedItem,
} from "../../services/scannerHistory";

import { safeAlert } from "../../components/ui/alert/safeAlert";
import { createThumbnail } from "../../utils/createThumbnail";
import BarcodeLink from "../../components/controls/BarcodeLink";

export default function EditScannedItemScreen({ route, navigation }) {
  const { item } = route.params;

  const barcode = item.barcode;

  // 📌 Estados
  const [name, setName] = useState(item.name ?? "");
  const [brand, setBrand] = useState(item.brand ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");
  const [thumbnailUri, setThumbnailUri] = useState(item.thumbnailUri ?? null);

  /* -------------------------------------------------
     Generar thumbnail al perder foco del input
  -------------------------------------------------- */
  const handleImageUrlBlur = async () => {
    if (!imageUrl || imageUrl === item.imageUrl) return;

    const thumb = await createThumbnail(imageUrl, barcode);
    if (thumb) setThumbnailUri(thumb);
  };

  /* -------------------------------------------------
     Guardar cambios
  -------------------------------------------------- */
  const hadleSave = async () => {
    if (!name.trim()) {
      safeAlert("Nombre requerido", "El producto debe tener un nombre");
      return;
    }

    let finalThumbnail = thumbnailUri;

    // Si hay URL nueva y aún no hay thumbnail
    if (imageUrl && imageUrl !== item.imageUrl && !thumbnailUri) {
      finalThumbnail = await createThumbnail(imageUrl, barcode);
    }

    await updateScannedEntry(barcode, {
      name: name.trim(),
      brand: brand.trim(),
      url: url.trim(),
      imageUrl: imageUrl.trim(),
      thumbnailUri: finalThumbnail,
      notes: notes.trim(),
    });

    navigation.goBack();
  };

  /* -------------------------------------------------
     Eliminar item
  -------------------------------------------------- */
  const removeItem = () => {
    safeAlert("Eliminar", `¿Deseas eliminar este escaneo?\n\n${name}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeScannedItem(barcode);
          navigation.goBack();
        },
      },
    ]);
  };

  /* ---------------------------
     Guardar
  ----------------------------*/
  const handleSave = () => {
    if (!name.trim()) {
      safeAlert("Nombre vacío", "El producto debe tener un nombre");
      return;
    }
    if (isUnitInvalid) {
      safeAlert(
        "Cantidad inválida",
        "Para unidades (u) la cantidad debe ser un número entero",
      );
      return;
    }
    const promoValidation = validatePromotionUnit(
      normalizePromotion(pricing.promo),
      pricing.unit,
    );
    if (!promoValidation.valid) {
      safeAlert("Oferta inválida", promoValidation.message);
      return;
    }
    updateItem(listId, itemId, {
      name: name.trim(),
      barcode: barcode.trim(),
      unit: pricing.unit, // 👈 CLAVE
      priceInfo,
    });
    navigation.goBack();
  };

  /* ---------------------------
     Eliminar
  ----------------------------*/
  const handleDelete = () => {
    safeAlert(
      "Eliminar producto",
      `¿Seguro que quieres eliminar "${item.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteItem(listId, itemId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Editar producto</Text>

        {/* CÓDIGO */}

        <Text style={styles.label}>Barcode</Text>
        <View style={styles.codeBox}>
          <BarcodeLink barcode={barcode} label={barcode} iconColor="#2563eb" />
        </View>

        {/* NOMBRE */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del producto"
        />

        {/* MARCA */}
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          value={brand}
          onChangeText={setBrand}
          placeholder="Marca"
        />

        {/* URL */}
        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="URL del producto"
          autoCapitalize="none"
        />

        {/* IMAGEN / THUMBNAIL */}
        <Text style={styles.label}>Imagen del producto</Text>

        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumb}
            contentFit="cover"
          />
        ) : (
          <View style={styles.noThumb}>
            <Text style={{ color: "#555" }}>64×64</Text>
          </View>
        )}

        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          onBlur={handleImageUrlBlur}
          placeholder="URL de la imagen"
          style={styles.input}
          autoCapitalize="none"
        />

        {/* NOTAS */}
        <Text style={styles.label}>Notas</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Añade una descripción o notas"
          multiline
          style={[styles.input, { height: 80 }]}
        />

        {/* ACCIONES */}
        <View
          style={[
            styles.actions,
            {
              paddingBottom: 8,
            },
          ]}
        >
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveText}>Guardar</Text>
          </Pressable>

          <Pressable style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* -------------------------------------------------
   🎨 ESTILOS
-------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#FAFAFA",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    marginTop: 10,
    fontWeight: "600",
  },

  codeBox: {
    backgroundColor: "#e8f0fe",
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#aabbee",
  },

  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 4,
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginTop: 6,
    marginBottom: 6,
  },

  noThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 6,
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    marginTop: 30,
    borderRadius: 6,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 12,
    marginTop: 15,
    borderRadius: 6,
  },

  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  /* ACTIONS */
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 30,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    height: 60,
    borderRadius: 20,

    backgroundColor: "#22c55e",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});
