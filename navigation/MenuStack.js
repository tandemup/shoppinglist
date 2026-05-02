// navigation/MenuStack.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ROUTES } from "./ROUTES";

import MenuScreen from "../screens/settings/MenuScreen";
import SearchEngines from "../screens/settings/SearchEngines";

const Stack = createNativeStackNavigator();

export default function MenuStack() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MENU}
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name={ROUTES.MENU}
        component={MenuScreen}
        options={{ title: "Menu" }}
      />

      <Stack.Screen
        name={ROUTES.SEARCH_ENGINES}
        component={SearchEngines}
        options={{ title: "Motor de búsqueda" }}
      />
      <Stack.Screen
        name={ROUTES.BARCODE_SETTINGS}
        component={SearchEngines}
        options={{ title: "Barcode config" }}
      />
      <Stack.Screen
        name={ROUTES.SEARCH_ENGINE_SETTINGS}
        component={SearchEngines}
        options={{ title: "Barcode config" }}
      />
    </Stack.Navigator>
  );
}
