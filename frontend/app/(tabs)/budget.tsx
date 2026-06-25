import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { ProgressBar } from "@/src/components/ProgressBar";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, monthName, isSameMonth } from "@/src/utils/format";
import { getCategory } from "@/src/utils/categories";

export default function BudgetScreen() {
  const { colors } = useTheme();
  const { monthlyBudget, setMonthlyBudget, transactions, totals } = useFinance();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(monthlyBudget));

  const spent = totals.monthExpenses;
  const remaining = Math.max(0, monthlyBudget - spent);
  const used = monthlyBudget > 0 ? spent / monthlyBudget : 0;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type !== "expense" || !isSameMonth(t.date)) continue;
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([key, amount]) => ({ key, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyPace = spent / Math.max(1, dayOfMonth);
  const projected = dailyPace * daysInMonth;
  const onTrack = projected <= monthlyBudget;

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
        <Text style={[styles.title, { color: colors.onSurface }]}>Budget</Text>
        <Text style={[styles.subtitle, { color: colors.info }]}>{monthName()}</Text>

        <Card variant="secondary" style={{ marginTop: spacing.lg }}>
          <View style={styles.headerRow}>
            <Text style={[styles.label, { color: colors.info }]}>Monthly Budget</Text>
            <Pressable
              testID="edit-budget-btn"
              onPress={() => {
                if (editing) {
                  const n = Number(draft.replace(/[^0-9.]/g, "")) || 0;
                  setMonthlyBudget(n);
                }
                setEditing((e) => !e);
              }}
            >
              <Text style={{ color: colors.brandPrimary, fontSize: fontSize.base }}>
                {editing ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>
          {editing ? (
            <View style={[styles.editRow, { borderColor: colors.border }]}>
              <Text style={[styles.currencySign, { color: colors.onSurface }]}>₹</Text>
              <TextInput
                testID="budget-input"
                value={draft}
                onChangeText={setDraft}
                keyboardType="number-pad"
                style={[styles.budgetInput, { color: colors.onSurface }]}
                placeholder="0"
                placeholderTextColor={colors.info}
              />
            </View>
          ) : (
            <Text style={[styles.bigAmount, { color: colors.onSurface }]} testID="budget-amount">
              {formatINR(monthlyBudget)}
            </Text>
          )}

          <ProgressBar progress={used} height={12} testID="budget-progress" />

          <View style={styles.metricRow}>
            <Metric label="Spent" value={formatINR(spent, { compact: true })} tint={colors.error} />
            <Metric label="Remaining" value={formatINR(remaining, { compact: true })} tint={colors.brandPrimary} />
            <Metric label="Used" value={`${Math.round(used * 100)}%`} tint={colors.onSurface} />
          </View>

          <View style={[styles.insight, { backgroundColor: colors.surfaceTertiary }]}>
            <MaterialCommunityIcons
              name={
                monthlyBudget === 0
                  ? "information-outline"
                  : onTrack
                  ? "check-circle-outline"
                  : "alert-circle-outline"
              }
              size={20}
              color={
                monthlyBudget === 0
                  ? colors.brandPrimary
                  : onTrack
                  ? colors.success
                  : colors.warning
              }
            />
            <Text style={[styles.insightText, { color: colors.onSurface }]} numberOfLines={2}>
              {monthlyBudget === 0
                ? "Set a monthly budget to track your spending pace."
                : onTrack
                ? `On track to save ${formatINR(Math.max(0, monthlyBudget - projected), { compact: true })} this month.`
                : `At this pace you'll overspend by ${formatINR(projected - monthlyBudget, { compact: true })}.`}
            </Text>
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.onSurface }]}>By Category</Text>

        {byCategory.length === 0 ? (
          <Card variant="secondary">
            <Text style={{ color: colors.info, fontSize: fontSize.base }}>
              No expenses this month yet.
            </Text>
          </Card>
        ) : (
          <Card variant="secondary" padding="md">
            {byCategory.map((row, i) => {
              const cat = getCategory(row.key as any);
              const share = monthlyBudget > 0 ? row.amount / monthlyBudget : 0;
              return (
                <View
                  key={row.key}
                  style={[
                    styles.catRow,
                    i < byCategory.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
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
                  <ProgressBar progress={share} height={6} />
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value, tint }: { label: string; value: string; tint: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.info }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: tint }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: fontSize["2xl"], fontWeight: "500" },
  subtitle: { fontSize: fontSize.base, marginTop: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: fontSize.sm },
  bigAmount: { fontSize: 32, fontWeight: "500", marginTop: spacing.xs, marginBottom: spacing.lg },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  currencySign: { fontSize: 28, fontWeight: "500", marginRight: spacing.sm },
  budgetInput: { fontSize: 28, fontWeight: "500", flex: 1, paddingVertical: spacing.sm },
  metricRow: { flexDirection: "row", marginTop: spacing.md, justifyContent: "space-between" },
  metric: { flex: 1 },
  metricLabel: { fontSize: fontSize.sm },
  metricValue: { fontSize: fontSize.lg, fontWeight: "500", marginTop: 2 },
  insight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  insightText: { flex: 1, fontSize: fontSize.base },
  section: { fontSize: fontSize.xl, fontWeight: "500", marginTop: spacing.xl, marginBottom: spacing.sm },
  catRow: { paddingVertical: spacing.md },
  catTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  catLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  catIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  catName: { fontSize: fontSize.base, fontWeight: "500" },
  catAmount: { fontSize: fontSize.base, fontWeight: "500" },
});
