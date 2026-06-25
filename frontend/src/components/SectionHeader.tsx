import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { fontSize, spacing } from "../theme/colors";

export function SectionHeader({
  title,
  action,
  style,
}: {
  title: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSize.xl, fontWeight: "500" },
});
