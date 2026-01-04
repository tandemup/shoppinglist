import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./ROUTES";

import StoresHomeScreen from "../screens/StoresHomeScreen";
import StoresBrowseScreen from "../screens/StoresBrowseScreen";
import StoresFavoritesScreen from "../screens/StoresFavoritesScreen";
import StoresNearbyScreen from "../screens/StoresNearbyScreen";
import StoreInfoScreen from "../screens/StoreInfoScreen";
import StoreDetailScreen from "../screens/StoreDetailScreen";

const Stack = createNativeStackNavigator();

export default function StoresStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ROUTES.STORES_HOME}
        component={StoresHomeScreen}
        options={{ title: "Tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_BROWSE}
        component={StoresBrowseScreen}
        options={{ title: "Explorar tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORES_FAVORITES}
        component={StoresFavoritesScreen}
        options={{ title: "Tiendas favoritas" }}
      />

      {/* ✅ NUEVAS */}
      <Stack.Screen
        name={ROUTES.STORES_NEARBY}
        component={StoresNearbyScreen}
        options={{ title: "Tiendas cercanas" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_INFO}
        component={StoreInfoScreen}
        options={{ title: "Información de tiendas" }}
      />

      <Stack.Screen
        name={ROUTES.STORE_DETAIL}
        component={StoreDetailScreen}
        options={{ title: "Detalle de tienda" }}
      />
    </Stack.Navigator>
  );
}
