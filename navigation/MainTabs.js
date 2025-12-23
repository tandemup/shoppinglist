import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ROUTES } from "./ROUTES";
import ShoppingStack from "./ShoppingStack";
import StoresStack from "./StoresStack";
import ScannerStack from "./ScannerStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name={ROUTES.SHOPPING_TAB}
        component={ShoppingStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cart-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.STORES_TAB}
        component={StoresStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="store-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.SCANNER_TAB}
        component={ScannerStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="barcode-scan"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
