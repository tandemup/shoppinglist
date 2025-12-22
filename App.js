// App.js — Navegación reorganizada 2025

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StoreProvider } from "./context/StoreContext";
import { ConfigProvider } from "./context/ConfigContext";

// Pantalla de carga
import SplashScreen from "./screens/SplashScreen";

// Navegación principal (tabs + stacks)
import MainTabs from "./navigation/MainTabs";

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
    <ConfigProvider>
      <StoreProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {/* Pantalla inicial */}
            <RootStack.Screen name="Splash" component={SplashScreen} />

            {/* Tabs principales (Listas, Tiendas, Escanear) */}
            <RootStack.Screen name="MainTabs" component={MainTabs} />
          </RootStack.Navigator>
        </NavigationContainer>
      </StoreProvider>
    </ConfigProvider>
  );
}
