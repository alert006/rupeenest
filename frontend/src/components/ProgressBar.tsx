import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";

type Props = {
  progress: number; // 0 - 1
  height?: number;
  tint?: string;
  background?: string;
  testID?: string;
};

export function ProgressBar({ progress, height = 10, tint, background, testID }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const dynamicTint =
    tint ??
    (clamped >= 1 ? colors.error : clamped >= 0.85 ? colors.warning : colors.brandPrimary);
  return (
    <View
      testID={testID}
      style={[
        styles.track,
        { height, backgroundColor: background ?? colors.surfaceTertiary, borderRadius: height / 2 },
      ]}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          backgroundColor: dynamicTint,
          borderRadius: radius.pill,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
});
