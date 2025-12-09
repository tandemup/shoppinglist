// navigation/StoresStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StoresScreen from "../screens/StoresScreen";

const Stack = createNativeStackNavigator();

export default function StoresStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="StoresRoot" component={StoresScreen} />
    </Stack.Navigator>
  );
}
