import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./ROUTES";

import ShoppingListsScreen from "../screens/ShoppingListsScreen";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import StoresScreen from "../screens/StoresScreen";
import StoreSelectScreen from "../screens/StoreSelectScreen";
import ArchivedListsScreen from "../screens/ArchivedListsScreen";
import ArchivedListDetailScreen from "../screens/ArchivedListDetailScreen";
import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen";
import ScannedHistoryScreen from "../screens/ScannedHistoryScreen";
import EditScannedItemScreen from "../screens/EditScannedItemScreen";
import StoreMapScreen from "../screens/StoreMapScreen";
import MenuScreen from "../screens/MenuScreen";

const Stack = createNativeStackNavigator();

export default function ShoppingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name={ROUTES.SHOPPING_LISTS}
        component={ShoppingListsScreen}
        options={{ title: "Listas de la compra" }}
      />

      <Stack.Screen
        name={ROUTES.SHOPPING_LIST}
        component={ShoppingListScreen}
        options={{ title: "Lista de la compra" }}
      />

      <Stack.Screen
        name={ROUTES.ITEM_DETAIL}
        component={ItemDetailScreen}
        options={{ title: "Editar producto" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_HOME}
        component={StoresScreen}
        options={{ title: "Seleccionar tienda" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_SELECT}
        component={StoreSelectScreen}
        options={{ title: "Sel tienda" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_MAP}
        component={StoreMapScreen}
        options={{ title: "Mapa de tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.ARCHIVED_LISTS}
        component={ArchivedListsScreen}
        options={{ title: "Archivadas" }}
      />

      <Stack.Screen
        name={ROUTES.ARCHIVED_LIST_DETAIL}
        component={ArchivedListDetailScreen}
        options={{ title: "Detalle archivado" }}
      />

      <Stack.Screen
        name={ROUTES.PURCHASE_HISTORY}
        component={PurchaseHistoryScreen}
        options={{ title: "Historial de compras" }}
      />

      <Stack.Screen
        name={ROUTES.SCANNED_HISTORY}
        component={ScannedHistoryScreen}
        options={{ title: "Historial de escaneos" }}
      />

      <Stack.Screen
        name={ROUTES.EDIT_SCANNED_ITEM}
        component={EditScannedItemScreen}
        options={{ title: "Editar escaneo" }}
      />

      <Stack.Screen
        name={ROUTES.MENU}
        component={MenuScreen}
        options={{ title: "Menú" }}
      />
    </Stack.Navigator>
  );
}
