import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing } from "../theme/colors";

type Variant = "secondary" | "tertiary" | "outline" | "surface";

export function Card({
  children,
  variant = "secondary",
  style,
  padding = "lg",
  testID,
}: {
  children: React.ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
  testID?: string;
}) {
  const { colors } = useTheme();
  const bg =
    variant === "tertiary" ? colors.surfaceTertiary :
    variant === "outline" ? "transparent" :
    variant === "surface" ? colors.surface :
    colors.surfaceSecondary;
  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          padding: spacing[padding],
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
});
