import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { spacing, fontSize } from "@/src/theme/colors";
import { setPin } from "@/src/utils/security";

export default function PinSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setPrefs } = useFinance();
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [first, setFirst] = useState("");
  const [pin, setPinValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onDigit = (d: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (pin.length >= 4) return;
    const next = pin + d;
    setPinValue(next);
    setError(null);
    if (next.length === 4) {
      setTimeout(() => commit(next), 120);
    }
  };

  const onBack = () => setPinValue((p) => p.slice(0, -1));

  const commit = async (value: string) => {
    if (stage === "create") {
      setFirst(value);
      setPinValue("");
      setStage("confirm");
      return;
    }
    if (value !== first) {
      setError("PINs didn't match. Try again.");
      setFirst("");
      setPinValue("");
      setStage("create");
      return;
    }
    if (Platform.OS !== "web") {
      await setPin(value);
    }
    await setPrefs({ pinEnabled: true });
    router.back();
  };

  const headline = stage === "create" ? "Set a 4-digit PIN" : "Confirm your PIN";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Pressable
          testID="pin-back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>PIN Lock</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={[styles.headline, { color: colors.onSurface }]}>{headline}</Text>
        <Text style={[styles.sub, { color: colors.info }]}>
          You&apos;ll need this PIN to open RupeeNest after the app is closed.
        </Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              testID={`pin-dot-${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor: i < pin.length ? colors.brandPrimary : "transparent",
                  borderColor: colors.brandPrimary,
                },
              ]}
            />
          ))}
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.error }]} testID="pin-error">{error}</Text>
        ) : null}

        <View style={styles.pad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, i) => {
            if (k === "") return <View key={i} style={styles.padKey} />;
            if (k === "back") {
              return (
                <Pressable
                  key={i}
                  testID="pin-delete"
                  onPress={onBack}
                  style={[styles.padKey, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <MaterialCommunityIcons name="backspace-outline" size={22} color={colors.onSurface} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={i}
                testID={`pin-key-${k}`}
                onPress={() => onDigit(k)}
                style={[styles.padKey, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.padKeyText, { color: colors.onSurface }]}>{k}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: { fontSize: fontSize.lg, fontWeight: "500" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, padding: spacing.xl, alignItems: "center" },
  headline: { fontSize: fontSize["2xl"], fontWeight: "500", textAlign: "center", marginTop: spacing.xl },
  sub: { fontSize: fontSize.base, textAlign: "center", marginTop: spacing.sm, maxWidth: 280 },
  dots: { flexDirection: "row", gap: spacing.md, marginTop: spacing["2xl"] },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  error: { fontSize: fontSize.base, marginTop: spacing.lg },
  pad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: spacing["2xl"], gap: spacing.md, maxWidth: 280 },
  padKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  padKeyText: { fontSize: 28, fontWeight: "500" },
});
