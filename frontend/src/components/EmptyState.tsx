import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { fontSize, spacing } from "../theme/colors";

export function EmptyState({
  icon = "wallet-outline",
  title,
  message,
  testID,
}: {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={styles.wrap}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceSecondary },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={40} color={colors.brandPrimary} />
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.info }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.xl, fontWeight: "500", marginBottom: spacing.xs, textAlign: "center" },
  message: { fontSize: fontSize.base, textAlign: "center", maxWidth: 280 },
});
