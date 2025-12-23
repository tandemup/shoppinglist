import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./ROUTES";

import StoresScreen from "../screens/StoresScreen";
import StoresBrowseScreen from "../screens/StoresBrowseScreen";
import StoreDetailScreen from "../screens/StoreDetailScreen";
import StoreMapScreen from "../screens/StoreMapScreen";
import StoresFavoritesScreen from "../screens/StoresFavoritesScreen";

const Stack = createNativeStackNavigator();

export default function StoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTES.STORES_HOME}
        component={StoresScreen}
        options={{ title: "Tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_BROWSE}
        component={StoresBrowseScreen}
        options={{ title: "Buscar tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_DETAIL}
        component={StoreDetailScreen}
        options={{ title: "Detalle de tienda" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_MAP}
        component={StoreMapScreen}
        options={{ title: "Mapa" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_FAVORITES}
        component={StoresFavoritesScreen}
        options={{ title: "Favoritas" }}
      />
    </Stack.Navigator>
  );
}
