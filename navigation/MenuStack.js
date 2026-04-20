import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./ROUTES";
import ProductLearningDebugScreen from "../screens/debug/ProductLearningDebugScreen";
import MenuScreen from "../screens/settings/MenuScreen";

import HistoryStack from "./HistoryStack";

const Stack = createNativeStackNavigator();

export default function MenuStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen
        name={ROUTES.MENU}
        component={MenuScreen}
        options={{ title: "Main Menu" }}
      />
      <Stack.Screen
        name={ROUTES.PRODUCT_LEARNING_DEBUG}
        component={ProductLearningDebugScreen}
        options={{ title: "Debug · Aprendizaje" }}
      />
      <Stack.Screen
        name={ROUTES.PURCHASE_HISTORY}
        component={HistoryStack}
        options={{ title: "Historial" }}
      />
    </Stack.Navigator>
  );
}
