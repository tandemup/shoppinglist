// navigation/ScannerStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ScannerTab from "../screens/ScannerTab";
import EditScannedItemScreen from "../screens/EditScannedItemScreen";
import ScannedHistoryScreen from "../screens/ScannedHistoryScreen";

const Stack = createNativeStackNavigator();

export default function ScannerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScannerHome" component={ScannerTab} />
      <Stack.Screen name="EditScannedItem" component={EditScannedItemScreen} />
      <Stack.Screen name="ScannedHistory" component={ScannedHistoryScreen} />
    </Stack.Navigator>
  );
}
