// navigation/HistoryStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";

const Stack = createNativeStackNavigator();

export default function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="PurchaseHistory"
        component={PurchaseHistoryScreen}
        options={{ title: "Historial" }}
      />

      <Stack.Screen
        name="HistoryItemDetail"
        component={ItemDetailScreen}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}
