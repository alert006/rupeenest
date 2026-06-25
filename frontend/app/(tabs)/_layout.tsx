import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/src/theme/ThemeContext";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.info,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor:
            Platform.OS === "android"
              ? isDark
                ? colors.surfaceSecondary
                : colors.surface
              : "transparent",
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 6,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={70}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
          tabBarButtonTestID: "tab-dashboard",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="swap-horizontal" size={size} color={color} />
          ),
          tabBarButtonTestID: "tab-transactions",
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-donut" size={size} color={color} />
          ),
          tabBarButtonTestID: "tab-budget",
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
          tabBarButtonTestID: "tab-reports",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
          tabBarButtonTestID: "tab-profile",
        }}
      />
    </Tabs>
  );
}
