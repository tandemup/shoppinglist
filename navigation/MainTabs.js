import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppIcon from "../components/AppIcon";

import { ROUTES } from "./ROUTES";
import ShoppingStack from "./ShoppingStack";
import StoresStack from "./StoresStack";
import ScannerStack from "./ScannerStack";
import MenuStack from "./MenuStack";

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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();

            navigation.navigate(ROUTES.STORES_TAB, {
              screen: ROUTES.STORES_HOME,
            });
          },
        })}
        options={{
          title: "Tiendas",
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="storefront-outline" size={size} color={color} />
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
      <Tab.Screen
        name={ROUTES.MENU_TAB}
        component={MenuStack}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <AppIcon name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
