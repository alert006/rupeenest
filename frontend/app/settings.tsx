import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";

export default function SettingsScreen() {
  const { colors, isDark, toggle, mode, setMode } = useTheme();
  const { clearAll, transactions } = useFinance();
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Pressable
          testID="settings-back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: Platform.OS === "ios" ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.section, { color: colors.info }]}>Appearance</Text>
        <Card variant="secondary" padding="md">
          <Row
            icon="theme-light-dark"
            label="Dark Mode"
            right={
              <Switch
                testID="settings-dark-toggle"
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
                thumbColor={colors.surface}
              />
            }
          />
          <Divider />
          <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
            <Text style={{ color: colors.onSurface, fontSize: fontSize.base, fontWeight: "500" }}>
              Theme preference
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {(["system", "light", "dark"] as const).map((m) => (
                <Pressable
                  key={m}
                  testID={`theme-${m}`}
                  onPress={() => setMode(m)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: mode === m ? colors.brandPrimary : colors.surface,
                      borderColor: mode === m ? colors.brandPrimary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: mode === m ? colors.onBrandPrimary : colors.onSurface,
                      fontSize: fontSize.sm,
                      fontWeight: "500",
                      textTransform: "capitalize",
                    }}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.info, marginTop: spacing.xl }]}>Data</Text>
        <Card variant="secondary" padding="md">
          <Row
            icon="database-outline"
            label={`${transactions.length} transactions stored locally`}
            right={null}
          />
          <Divider />
          <Pressable
            testID="clear-data-btn"
            onPress={() =>
              Alert.alert(
                "Clear all data?",
                "This will remove all transactions saved on this device.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: () => clearAll() },
                ],
              )
            }
            style={styles.rowBtn}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.error }]}>Clear all transactions</Text>
          </Pressable>
        </Card>

        <Text style={[styles.section, { color: colors.info, marginTop: spacing.xl }]}>About</Text>
        <Card variant="secondary" padding="md">
          <Row icon="information-outline" label="RupeeNest" right={<Text style={{ color: colors.info }}>v1.0.0</Text>} />
          <Divider />
          <View style={{ paddingVertical: spacing.md, gap: spacing.xs }}>
            <Text style={{ color: colors.onSurface, fontSize: fontSize.base, fontWeight: "500" }}>
              Offline-first personal finance
            </Text>
            <Text style={{ color: colors.info, fontSize: fontSize.sm, lineHeight: 20 }}>
              RupeeNest helps you track income, expenses, and budgets — all stored privately on your device. No accounts,
              no syncing, no ads.
            </Text>
          </View>
          <Divider />
          <Row icon="shield-lock-outline" label="Privacy" right={<Text style={{ color: colors.info }}>Local only</Text>} />
          <Divider />
          <Row icon="currency-inr" label="Currency" right={<Text style={{ color: colors.info }}>Indian Rupee (₹)</Text>} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  right,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  right: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: colors.brandTertiary }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.onBrandTertiary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]} numberOfLines={1}>
        {label}
      </Text>
      {right}
    </View>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: 52 }} />;
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
  section: { fontSize: fontSize.sm, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  rowBtn: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: fontSize.base, fontWeight: "500" },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
