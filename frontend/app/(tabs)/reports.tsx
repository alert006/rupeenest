import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, monthName, isSameMonth } from "@/src/utils/format";
import { getCategory } from "@/src/utils/categories";

export default function ReportsScreen() {
  const { colors } = useTheme();
  const { transactions, totals } = useFinance();

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

  const savingsRate =
    totals.monthIncome > 0
      ? Math.max(0, Math.min(100, ((totals.monthIncome - totals.monthExpenses) / totals.monthIncome) * 100))
      : 0;

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
        <Text style={[styles.title, { color: colors.onSurface }]}>Reports</Text>
        <Text style={[styles.subtitle, { color: colors.info }]}>{monthName()}</Text>

        <View style={styles.statsRow}>
          <Card variant="secondary" style={styles.statCard}>
            <MaterialCommunityIcons name="trending-up" size={22} color={colors.success} />
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
            <MaterialCommunityIcons name="piggy-bank-outline" size={22} color={colors.brandPrimary} />
            <Text style={[styles.statLabel, { color: colors.info }]}>Savings</Text>
            <Text style={[styles.statValue, { color: colors.onSurface }]}>
              {Math.round(savingsRate)}%
            </Text>
          </Card>
        </View>

        <Text style={[styles.section, { color: colors.onSurface }]}>Last 6 Months</Text>
        <Card variant="secondary">
          <View style={styles.chartRow}>
            {last6Months.map((m) => {
              const inH = (m.income / maxBar) * 110;
              const exH = (m.expense / maxBar) * 110;
              return (
                <View key={m.label} style={styles.chartCol}>
                  <View style={styles.bars}>
                    <View style={[styles.bar, { height: inH, backgroundColor: colors.brandPrimary }]} />
                    <View style={[styles.bar, { height: exH, backgroundColor: colors.warning }]} />
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
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
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
