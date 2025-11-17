import React from "react";
import { StoreProvider } from "./context/StoreContext";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";

// 🖼️ Screens
import SplashScreen from "./screens/SplashScreen";
import ShoppingListScreen from "./screens/ShoppingListScreen";
import ShoppingListsScreen from "./screens/ShoppingListsScreen";
import ItemDetailScreen from "./screens/ItemDetailScreen";
import PurchaseHistoryScreen from "./screens/PurchaseHistoryScreen";
import ScannedHistoryScreen from "./screens/ScannedHistoryScreen";
import SearchItemsScreen from "./screens/SearchItemsScreen";
import StoresScreen from "./screens/StoresScreen";
import MenuScreen from "./screens/MenuScreen";
import ScannerTab from "./screens/ScannerTab";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

//
// 🧱 1️⃣ STACK DE COMPRAS (Listas, Detalles, etc.)
//
function ShoppingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShoppingLists"
        component={ShoppingListsScreen}
        options={{
          title: "Shopping Lists",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        }}
      />
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          title: "Shopping List",
          headerBackTitle: "Atrás",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        }}
      />
      <Stack.Screen
        name="ItemDetailScreen"
        component={ItemDetailScreen}
        options={{
          title: "Editar producto",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        }}
      />
      <Stack.Screen
        name="PurchaseHistory"
        component={PurchaseHistoryScreen}
        options={{ title: "Historial de compras", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="ScannedHistory"
        component={ScannedHistoryScreen}
        options={{ title: "Historial de escaneos", headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="SearchItems"
        component={SearchItemsScreen}
        options={{ title: "Buscar productos" }}
      />
      <Stack.Screen
        name="StoresScreen"
        component={StoresScreen}
        options={{ title: "Tiendas" }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: "Menú", headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
}

//
// 🧭 2️⃣ TABS PRINCIPALES
//
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Listas"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { height: 70, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Listas") iconName = "cart";
          if (route.name === "Tiendas") iconName = "store";
          if (route.name === "Escanear") iconName = "barcode-scan";
          return (
            <MaterialCommunityIcons name={iconName} color={color} size={size} />
          );
        },
      })}
    >
      <Tab.Screen
        name="Listas"
        component={ShoppingStack}
        options={{
          tabBarLabel: "Listas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tiendas"
        component={StoresScreen}
        options={{
          tabBarLabel: "Tiendas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="store" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Escanear"
        component={ScannerTab}
        options={{
          tabBarLabel: "Escanear",
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

//
// 🚀 3️⃣ NAVEGADOR PRINCIPAL (Splash + Tabs)
//
export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Pantalla inicial */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          {/* Navegación principal */}
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}
