import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ⚠️ OJO: NO usar StoresScreen aquí
import StoresBrowseScreen from "../screens/StoresBrowseScreen";
import StoreDetailScreen from "../screens/StoreDetailScreen";
import StoreMapScreen from "../screens/StoreMapScreen";

const Stack = createNativeStackNavigator();

export default function StoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StoresRoot"
        component={StoresBrowseScreen}
        options={{ title: "Tiendas" }}
      />

      <Stack.Screen
        name="StoreDetail"
        component={StoreDetailScreen}
        options={{ title: "Detalle de tienda" }}
      />

      <Stack.Screen
        name="StoreMap"
        component={StoreMapScreen}
        options={{ title: "Mapa de tiendas" }}
      />
    </Stack.Navigator>
  );
}
