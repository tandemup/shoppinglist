import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./ROUTES";

import StoresHomeScreen from "../screens/stores/StoresHomeScreen";
import StoreSelectScreen from "../screens/stores/StoreSelectScreen";
import StoresBrowseScreen from "../screens/stores/StoresBrowseScreen";
import StoresFavoritesScreen from "../screens/stores/StoresFavoritesScreen";
import StoresNearbyScreen from "../screens/stores/StoresNearbyScreen";
import StoreDetailScreen from "../screens/stores/StoreDetailScreen";
import StoreInfoScreen from "../screens/stores/StoreInfoScreen";

const Stack = createNativeStackNavigator();

export default function StoresStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitle: "",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.STORES_HOME}
        component={StoresHomeScreen}
        options={{ title: "Tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_SELECT}
        component={StoreSelectScreen}
        options={{ title: "Seleccionar tienda" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_BROWSE}
        component={StoresBrowseScreen}
        options={{ title: "Explorar tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_NEARBY}
        component={StoresNearbyScreen}
        options={{ title: "Tiendas cercanas" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_FAVORITES}
        component={StoresFavoritesScreen}
        options={{ title: "Tiendas favoritas" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_DETAIL}
        component={StoreDetailScreen}
        options={{
          title: "Detalle de tienda",
          headerBackTitleVisible: false,
        }}
      />

      <Stack.Screen
        name={ROUTES.STORE_INFO}
        component={StoreInfoScreen}
        options={{ title: "Información" }}
      />
    </Stack.Navigator>
  );
}
