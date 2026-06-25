import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../theme/ThemeContext";
import { radius, spacing, fontSize } from "../theme/colors";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  testID?: string;
};

export function Chip({ label, selected, onPress, icon, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.brandPrimary : colors.surfaceSecondary,
          borderColor: selected ? colors.brandPrimary : colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={16}
            color={selected ? colors.onBrandPrimary : colors.onSurfaceSecondary}
            style={{ marginRight: 6 }}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: selected ? colors.onBrandPrimary : colors.onSurfaceSecondary },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  row: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: fontSize.base, fontWeight: "500" },
});
