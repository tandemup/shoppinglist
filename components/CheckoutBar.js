import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutBar({ total, onCheckout }) {
  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>{total.toFixed(2)} €</Text>
      </View>

      <Pressable style={styles.button} onPress={onCheckout}>
        <Ionicons name="cart-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Finalizar compra</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 22,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

/* -------------------------------------------------
   Styles
-------------------------------------------------- */
const styles1 = StyleSheet.create({
  container: {
    padding: 16,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  totalContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  totalValue: {
    fontSize: 23,
    fontWeight: "700",
    color: "#333",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
