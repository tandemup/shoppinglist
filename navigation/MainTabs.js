// navigation/MainTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ShoppingStack from "./ShoppingStack";
import StoresStack from "./StoresStack";
import ScannerStack from "./ScannerStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 4 },
      }}
    >
      {/* 🛒 Lista de compras */}
      <Tab.Screen
        name="Listas"
        component={ShoppingStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
        }}
      />

      {/* 🏪 Tiendas */}
      <Tab.Screen
        name="Tiendas"
        component={StoresStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="store" color={color} size={size} />
          ),
        }}
      />

      {/* 📷 Escanear */}
      <Tab.Screen
        name="Escanear"
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
