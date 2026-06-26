import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, monthName, isSameMonth } from "@/src/utils/format";
import { getCategory, BUCKET_META, Bucket, bucketOfCategory } from "@/src/utils/categories";
import { computeBudgetScore, smartInsight } from "@/src/utils/insights";

export default function InsightsScreen() {
  const { colors } = useTheme();
  const { transactions, totals, smartBudgetTotals } = useFinance();

  const last6Months = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        const td = new Date(t.date);
        if (td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()) {
          if (t.type === "income") income += t.amount;
          else expense += t.amount;
        }
      }
      months.push({
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        income,
        expense,
      });
    }
    return months;
  }, [transactions]);

  const maxBar = Math.max(1, ...last6Months.flatMap((m) => [m.income, m.expense]));

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense" || !isSameMonth(t.date)) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    const arr = Array.from(map.entries()).map(([key, amount]) => ({ key, amount }));
    arr.sort((a, b) => b.amount - a.amount);
    return arr.slice(0, 5);
  }, [transactions]);

  const totalThisMonth = topCategories.reduce((s, x) => s + x.amount, 0);

  const budgetScore = useMemo(() => computeBudgetScore(smartBudgetTotals), [smartBudgetTotals]);
  const insight = useMemo(
    () => smartInsight(smartBudgetTotals, totals.monthIncome),
    [smartBudgetTotals, totals.monthIncome]
  );

  const bucketSpend: Record<Bucket, number> = useMemo(() => {
    const acc = { needs: 0, wants: 0, savings: 0 };
    for (const t of transactions) {
      if (t.type !== "expense" || !isSameMonth(t.date)) continue;
      const b = t.bucket ?? bucketOfCategory(t.category);
      if (b) acc[b] += t.amount;
    }
    return acc;
  }, [transactions]);

  const scoreColor =
    budgetScore >= 75 ? colors.brandPrimary : budgetScore >= 50 ? colors.warning : colors.error;

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === "ios" ? 120 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>Insights</Text>
        <Text style={[styles.subtitle, { color: colors.info }]}>{monthName()}</Text>

        <View style={styles.statsRow}>
          <Card variant="secondary" style={styles.statCard}>
            <MaterialCommunityIcons name="trending-up" size={22} color={colors.brandPrimary} />
            <Text style={[styles.statLabel, { color: colors.info }]}>Income</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>
              {formatINR(totals.monthIncome, { compact: true })}
            </Text>
          </Card>
          <Card variant="secondary" style={styles.statCard}>
            <MaterialCommunityIcons name="trending-down" size={22} color={colors.error} />
            <Text style={[styles.statLabel, { color: colors.info }]}>Expenses</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>
              {formatINR(totals.monthExpenses, { compact: true })}
            </Text>
          </Card>
          <Card variant="secondary" style={styles.statCard}>
            <MaterialCommunityIcons name="scale-balance" size={22} color={colors.brandSecondary} />
            <Text style={[styles.statLabel, { color: colors.info }]}>Net</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>
              {formatINR(totals.monthIncome - totals.monthExpenses, { compact: true })}
            </Text>
          </Card>
        </View>

        <Text style={[styles.section, { color: colors.onSurface }]}>Budget Score</Text>
        <Card variant="secondary">
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: scoreColor }]} testID="insights-budget-score">
              {budgetScore}
            </Text>
            <Text style={[styles.scoreMax, { color: colors.info }]}> / 100</Text>
          </View>
          <View style={[styles.scoreTrack, { backgroundColor: colors.surfaceTertiary }]}>
            <View
              style={{
                width: `${budgetScore}%`,
                height: "100%",
                backgroundColor: scoreColor,
                borderRadius: radius.pill,
              }}
            />
          </View>
          <View style={[styles.insightRow, { backgroundColor: colors.surfaceTertiary }]}>
            <MaterialCommunityIcons name="lightbulb-outline" size={18} color={colors.brandPrimary} />
            <Text style={[styles.insightText, { color: colors.onSurface }]} numberOfLines={2}>
              {insight}
            </Text>
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.onSurface }]}>Category Breakdown</Text>
        <Card variant="secondary" padding="md">
          {(["needs", "wants", "savings"] as Bucket[]).map((b, i) => {
            const meta = BUCKET_META[b];
            const total = bucketSpend.needs + bucketSpend.wants + bucketSpend.savings;
            const share = total > 0 ? bucketSpend[b] / total : 0;
            const accent =
              b === "needs"
                ? colors.bucketNeeds
                : b === "wants"
                ? colors.bucketWants
                : colors.bucketSavings;
            return (
              <View
                key={b}
                style={[
                  styles.bucketRow,
                  i < 2 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.divider,
                  },
                ]}
              >
                <View style={styles.bucketTop}>
                  <View style={styles.bucketLeft}>
                    <View style={[styles.bucketDot, { backgroundColor: accent }]} />
                    <Text style={[styles.bucketName, { color: colors.onSurface }]}>{meta.label}</Text>
                  </View>
                  <Text style={[styles.bucketAmount, { color: colors.onSurface }]}>
                    {formatINR(bucketSpend[b], { compact: true })}
                  </Text>
                </View>
                <View style={[styles.bucketTrack, { backgroundColor: colors.surfaceTertiary }]}>
                  <View
                    style={{
                      width: `${share * 100}%`,
                      height: "100%",
                      backgroundColor: accent,
                      borderRadius: radius.pill,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </Card>

        <Text style={[styles.section, { color: colors.onSurface }]}>Income vs Expenses</Text>
        <Card variant="secondary">
          <View style={styles.chartRow}>
            {last6Months.map((m) => {
              const inH = (m.income / maxBar) * 110;
              const exH = (m.expense / maxBar) * 110;
              return (
                <View key={m.label} style={styles.chartCol}>
                  <View style={styles.bars}>
                    <View style={[styles.bar, { height: inH, backgroundColor: colors.brandPrimary }]} />
                    <View style={[styles.bar, { height: exH, backgroundColor: colors.bucketWants }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.info }]}>{m.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.brandPrimary }]} />
              <Text style={[styles.legendText, { color: colors.info }]}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.bucketWants }]} />
              <Text style={[styles.legendText, { color: colors.info }]}>Expenses</Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.onSurface }]}>Top Spending Categories</Text>
        {topCategories.length === 0 ? (
          <Card variant="secondary">
            <Text style={{ color: colors.info, fontSize: fontSize.base }}>
              Not enough data yet. Add a few expenses to see insights.
            </Text>
          </Card>
        ) : (
          <Card variant="secondary" padding="md">
            {topCategories.map((row, i) => {
              const cat = getCategory(row.key as any);
              const share = totalThisMonth > 0 ? row.amount / totalThisMonth : 0;
              return (
                <View
                  key={row.key}
                  style={[
                    styles.catRow,
                    i < topCategories.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <View style={styles.catTop}>
                    <View style={styles.catLeft}>
                      <View style={[styles.catIcon, { backgroundColor: colors.brandTertiary }]}>
                        <MaterialCommunityIcons
                          name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                          size={18}
                          color={colors.onBrandTertiary}
                        />
                      </View>
                      <Text style={[styles.catName, { color: colors.onSurface }]}>{cat.label}</Text>
                    </View>
                    <Text style={[styles.catAmount, { color: colors.onSurface }]}>
                      {formatINR(row.amount, { compact: true })}
                    </Text>
                  </View>
                  <View style={[styles.shareTrack, { backgroundColor: colors.surfaceTertiary }]}>
                    <View
                      style={{
                        width: `${share * 100}%`,
                        height: "100%",
                        backgroundColor: colors.brandSecondary,
                        borderRadius: radius.pill,
                      }}
                    />
                  </View>
                  <Text style={[styles.shareText, { color: colors.info }]}>
                    {Math.round(share * 100)}% of total expenses
                  </Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: fontSize["2xl"], fontWeight: "500" },
  subtitle: { fontSize: fontSize.base, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  statCard: { flex: 1, padding: spacing.md, gap: spacing.xs },
  statLabel: { fontSize: fontSize.sm },
  statValue: { fontSize: fontSize.lg, fontWeight: "500" },
  section: { fontSize: fontSize.xl, fontWeight: "500", marginTop: spacing.xl, marginBottom: spacing.sm },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginBottom: spacing.sm },
  scoreValue: { fontSize: 44, fontWeight: "500" },
  scoreMax: { fontSize: fontSize.lg, marginLeft: 4 },
  scoreTrack: { height: 10, borderRadius: radius.pill, overflow: "hidden", marginBottom: spacing.md },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  insightText: { flex: 1, fontSize: fontSize.base },
  bucketRow: { paddingVertical: spacing.md },
  bucketTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  bucketLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bucketDot: { width: 10, height: 10, borderRadius: 5 },
  bucketName: { fontSize: fontSize.base, fontWeight: "500" },
  bucketAmount: { fontSize: fontSize.base, fontWeight: "500" },
  bucketTrack: { height: 6, borderRadius: radius.pill, overflow: "hidden" },
  chartRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 140 },
  chartCol: { alignItems: "center", flex: 1 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 110 },
  bar: { width: 10, borderRadius: 4 },
  barLabel: { fontSize: fontSize.sm, marginTop: spacing.xs },
  legend: { flexDirection: "row", justifyContent: "center", gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSize.sm },
  catRow: { paddingVertical: spacing.md },
  catTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  catLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  catIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  catName: { fontSize: fontSize.base, fontWeight: "500" },
  catAmount: { fontSize: fontSize.base, fontWeight: "500" },
  shareTrack: { height: 6, borderRadius: radius.pill, overflow: "hidden" },
  shareText: { fontSize: fontSize.sm, marginTop: 4 },
});
