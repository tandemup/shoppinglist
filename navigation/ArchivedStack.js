// navigation/ArchivedStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArchivedListsScreen from "../screens/ArchivedListsScreen";
import ArchivedListDetailScreen from "../screens/ArchivedListDetailScreen";

const Stack = createNativeStackNavigator();

export default function ArchivedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: { fontSize: 20, fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="ArchivedLists" component={ArchivedListsScreen} />

      <Stack.Screen
        name="ArchivedListDetail"
        component={ArchivedListDetailScreen}
      />
    </Stack.Navigator>
  );
}
