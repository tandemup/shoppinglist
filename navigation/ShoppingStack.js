// navigation/ShoppingStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ShoppingListsScreen from "../screens/ShoppingListsScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import StoresScreen from "../screens/StoresScreen";
import ArchivedListsScreen from "../screens/ArchivedListsScreen";
import ArchivedListDetailScreen from "../screens/ArchivedListDetailScreen";
import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen";
import ScannedHistoryScreen from "../screens/ScannedHistoryScreen";
import EditScannedItemScreen from "../screens/EditScannedItemScreen";
import MenuScreen from "../screens/MenuScreen";

const Stack = createNativeStackNavigator();

export default function ShoppingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#fff" },
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="ShoppingLists"
        component={ShoppingListsScreen}
        options={{ title: "Shopping Lists" }}
      />

      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{ title: "Shopping List" }}
      />

      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: "Editar" }}
      />

      {/* Accesible desde un producto: seleccionar tienda */}
      <Stack.Screen
        name="Stores"
        component={StoresScreen}
        options={{ title: "Tiendas" }}
      />

      {/* Archivadas */}
      <Stack.Screen
        name="ArchivedLists"
        component={ArchivedListsScreen}
        options={{ title: "Archivadas" }}
      />

      <Stack.Screen
        name="ArchivedListDetail"
        component={ArchivedListDetailScreen}
        options={{ title: "Detalle" }}
      />

      {/* Historial desde menú */}
      <Stack.Screen
        name="PurchaseHistory"
        component={PurchaseHistoryScreen}
        options={{ title: "Historial de compras" }}
      />

      <Stack.Screen
        name="ScannedHistory"
        component={ScannedHistoryScreen}
        options={{ title: "Historial de escaneos" }}
      />

      <Stack.Screen
        name="EditScannedItem"
        component={EditScannedItemScreen}
        options={{ title: "Editar escaneo" }}
      />

      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: "Menú" }}
      />
    </Stack.Navigator>
  );
}
