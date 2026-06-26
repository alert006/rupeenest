import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { TransactionRow } from "@/src/components/TransactionRow";
import { SectionHeader } from "@/src/components/SectionHeader";
import { EmptyState } from "@/src/components/EmptyState";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, greeting, monthName } from "@/src/utils/format";
import { Bucket, BUCKET_META } from "@/src/utils/categories";
import { smartInsight } from "@/src/utils/insights";

export default function Dashboard() {
  const { colors, isDark } = useTheme();
  const { userName, transactions, totals, smartBudgetTotals } = useFinance();
  const router = useRouter();

  const recent = useMemo(() => transactions.slice(0, 6), [transactions]);
  const insight = useMemo(
    () => smartInsight(smartBudgetTotals, totals.monthIncome),
    [smartBudgetTotals, totals.monthIncome]
  );

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "ios" ? 140 : 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greet, { color: colors.info }]}>{greeting()},</Text>
            <Text style={[styles.name, { color: colors.onSurface }]} testID="user-greeting">{userName}</Text>
          </View>
          <Pressable
            testID="open-settings-btn"
            onPress={() => router.push("/settings")}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.onSurface} />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(380)}>
          <LinearGradient
            colors={
              isDark
                ? [colors.brandTertiary, colors.surfaceSecondary]
                : [colors.brandPrimary, colors.brandSecondary]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={[styles.heroLabel, { color: isDark ? colors.onBrandTertiary : colors.onBrandPrimary }]}>
              Current Balance
            </Text>
            <Text
              style={[styles.heroAmount, { color: isDark ? colors.onBrandTertiary : colors.onBrandPrimary }]}
              testID="dashboard-balance"
            >
              {formatINR(totals.balance)}
            </Text>
            <Text
              style={[styles.heroSub, { color: isDark ? colors.onBrandTertiary : colors.onBrandPrimary, opacity: 0.85 }]}
            >
              {monthName()}
            </Text>

            <View style={styles.heroRow}>
              <HeroPill
                tint={isDark ? colors.surface : colors.onBrandPrimary}
                bg={isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)"}
                icon="arrow-down-circle-outline"
                label="Income"
                value={formatINR(totals.monthIncome, { compact: true })}
                testID="dashboard-income"
              />
              <HeroPill
                tint={isDark ? colors.surface : colors.onBrandPrimary}
                bg={isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)"}
                icon="arrow-up-circle-outline"
                label="Expenses"
                value={formatINR(totals.monthExpenses, { compact: true })}
                testID="dashboard-expenses"
              />
              <HeroPill
                tint={isDark ? colors.surface : colors.onBrandPrimary}
                bg={isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.18)"}
                icon="piggy-bank-outline"
                label="Savings"
                value={formatINR(Math.max(0, totals.monthIncome - totals.monthExpenses), { compact: true })}
                testID="dashboard-savings"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        <SectionHeader
          title="Smart Budget"
          action={
            <Pressable testID="dashboard-budget-edit" onPress={() => router.push("/(tabs)/budget")}>
              <Text style={{ color: colors.brandPrimary, fontSize: fontSize.base }}>Edit</Text>
            </Pressable>
          }
        />

        <View style={{ gap: spacing.md }}>
          <SmartBudgetCard bucket="needs" />
          <SmartBudgetCard bucket="wants" />
          <SmartBudgetCard bucket="savings" />
        </View>

        <Animated.View entering={FadeIn.delay(120)}>
          <Card
            variant="secondary"
            style={{ marginTop: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md }}
          >
            <View style={[styles.insightIcon, { backgroundColor: colors.brandTertiary }]}>
              <MaterialCommunityIcons name="lightbulb-outline" size={22} color={colors.onBrandTertiary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.insightLabel, { color: colors.info }]}>Smart Insight</Text>
              <Text style={[styles.insightText, { color: colors.onSurface }]} testID="dashboard-smart-insight">
                {insight}
              </Text>
            </View>
          </Card>
        </Animated.View>

        <SectionHeader
          title="Recent Activity"
          action={
            <Pressable
              testID="see-all-transactions"
              onPress={() => router.push("/(tabs)/transactions")}
            >
              <Text style={{ color: colors.brandPrimary, fontSize: fontSize.base }}>See all</Text>
            </Pressable>
          }
        />

        {recent.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="No transactions yet"
            message="Tap the + button to record your first transaction."
          />
        ) : (
          <Card variant="secondary" padding="sm">
            {recent.map((t, i) => (
              <View key={t.id}>
                <TransactionRow
                  transaction={t}
                  onPress={() => router.push({ pathname: "/add-transaction", params: { id: t.id } })}
                  testID={`recent-tx-${i}`}
                />
                {i < recent.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                ) : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Pressable
        testID="add-transaction-fab"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push("/add-transaction");
        }}
        style={[styles.fab, { backgroundColor: colors.brandPrimary }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color={colors.onBrandPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

function SmartBudgetCard({ bucket }: { bucket: Bucket }) {
  const { colors } = useTheme();
  const { smartBudgetTotals } = useFinance();
  const meta = BUCKET_META[bucket];
  const target = smartBudgetTotals.targets[bucket];
  const spent = smartBudgetTotals.spent[bucket];
  const remaining = smartBudgetTotals.remaining[bucket];
  const progress = smartBudgetTotals.progress[bucket];
  const accent =
    bucket === "needs" ? colors.bucketNeeds : bucket === "wants" ? colors.bucketWants : colors.bucketSavings;
  const accentSoft =
    bucket === "needs"
      ? colors.bucketNeedsSoft
      : bucket === "wants"
      ? colors.bucketWantsSoft
      : colors.bucketSavingsSoft;
  const isSavings = bucket === "savings";

  return (
    <Card variant="secondary" testID={`smart-budget-${bucket}`}>
      <View style={styles.smartTop}>
        <View style={[styles.smartIcon, { backgroundColor: accentSoft }]}>
          <MaterialCommunityIcons
            name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={20}
            color={accent}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.smartTitle, { color: colors.onSurface }]}>{meta.label}</Text>
          <Text style={[styles.smartSub, { color: colors.info }]}>{meta.description}</Text>
        </View>
        <Text style={[styles.smartTarget, { color: colors.onSurface }]}>
          {formatINR(target, { compact: true })}
        </Text>
      </View>
      <View style={styles.smartRow}>
        <Metric label={isSavings ? "Saved" : "Spent"} value={formatINR(spent, { compact: true })} />
        <Metric
          label={isSavings ? "Goal" : "Target"}
          value={formatINR(target, { compact: true })}
        />
        <Metric label="Remaining" value={formatINR(remaining, { compact: true })} />
      </View>
      <View style={[styles.smartTrack, { backgroundColor: colors.surfaceTertiary }]}>
        <View
          testID={`smart-progress-${bucket}`}
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            backgroundColor: accent,
            borderRadius: radius.pill,
          }}
        />
      </View>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.metricLabel, { color: colors.info }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.onSurface }]}>{value}</Text>
    </View>
  );
}

function HeroPill({
  icon,
  label,
  value,
  tint,
  bg,
  testID,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  tint: string;
  bg: string;
  testID?: string;
}) {
  return (
    <View testID={testID} style={[styles.heroPill, { backgroundColor: bg }]}>
      <MaterialCommunityIcons name={icon} size={18} color={tint} />
      <Text style={[styles.heroPillLabel, { color: tint, opacity: 0.85 }]}>{label}</Text>
      <Text style={[styles.heroPillValue, { color: tint }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  greet: { fontSize: fontSize.base },
  name: { fontSize: fontSize["2xl"], fontWeight: "500", marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: { borderRadius: radius.lg, padding: spacing.xl },
  heroLabel: { fontSize: fontSize.base, opacity: 0.9 },
  heroAmount: { fontSize: 36, fontWeight: "500", marginTop: spacing.xs, letterSpacing: -0.5 },
  heroSub: { fontSize: fontSize.sm, marginTop: 2 },
  heroRow: { flexDirection: "row", marginTop: spacing.xl, gap: spacing.sm },
  heroPill: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: "flex-start",
  },
  heroPillLabel: { fontSize: 11, marginTop: 4 },
  heroPillValue: { fontSize: fontSize.lg, fontWeight: "500", marginTop: 2 },
  smartTop: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  smartIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  smartTitle: { fontSize: fontSize.lg, fontWeight: "500" },
  smartSub: { fontSize: fontSize.sm, marginTop: 2 },
  smartTarget: { fontSize: fontSize.lg, fontWeight: "500" },
  smartRow: { flexDirection: "row", marginBottom: spacing.sm },
  metricLabel: { fontSize: fontSize.sm },
  metricValue: { fontSize: fontSize.base, fontWeight: "500", marginTop: 2 },
  smartTrack: { height: 8, borderRadius: radius.pill, overflow: "hidden" },
  insightIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  insightLabel: { fontSize: fontSize.sm },
  insightText: { fontSize: fontSize.base, fontWeight: "500", marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: Platform.OS === "ios" ? 100 : 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 6px 12px rgba(0,0,0,0.18)",
    elevation: 6,
  },
});
