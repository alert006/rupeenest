import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, monthName } from "@/src/utils/format";
import { Bucket, BUCKET_META } from "@/src/utils/categories";
import { deriveTargets } from "@/src/utils/insights";

export default function BudgetScreen() {
  const { colors } = useTheme();
  const { totals, smartBudget, setSmartBudget, smartBudgetTotals } = useFinance();
  const auto = useMemo(() => deriveTargets(totals.monthIncome, { needs: 0, wants: 0, savings: 0 }), [totals.monthIncome]);
  const [draft, setDraft] = useState({
    needs: smartBudget.needs ? String(smartBudget.needs) : "",
    wants: smartBudget.wants ? String(smartBudget.wants) : "",
    savings: smartBudget.savings ? String(smartBudget.savings) : "",
  });
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    setSmartBudget({
      needs: Number(draft.needs.replace(/[^0-9.]/g, "")) || 0,
      wants: Number(draft.wants.replace(/[^0-9.]/g, "")) || 0,
      savings: Number(draft.savings.replace(/[^0-9.]/g, "")) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onReset = () => {
    setDraft({ needs: "", wants: "", savings: "" });
    setSmartBudget({ needs: 0, wants: 0, savings: 0 });
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === "ios" ? 220 : 200,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>Smart Budget</Text>
        <Text style={[styles.subtitle, { color: colors.info }]}>{monthName()}</Text>

        <Card variant="secondary" style={{ marginTop: spacing.lg }}>
          <Text style={[styles.label, { color: colors.info }]}>Total Target</Text>
          <Text style={[styles.bigAmount, { color: colors.onSurface }]} testID="budget-total-target">
            {formatINR(smartBudgetTotals.totalTarget)}
          </Text>
          <Text style={[styles.helper, { color: colors.info }]}>
            Targets adapt automatically to your monthly income. Override below if you prefer custom limits.
          </Text>
        </Card>

        {(["needs", "wants", "savings"] as Bucket[]).map((b) => (
          <BucketEditor
            key={b}
            bucket={b}
            value={draft[b]}
            placeholder={auto[b] ? String(auto[b]) : "0"}
            onChange={(v) => setDraft((d) => ({ ...d, [b]: v }))}
            spent={smartBudgetTotals.spent[b]}
            target={smartBudgetTotals.targets[b]}
            progress={smartBudgetTotals.progress[b]}
          />
        ))}

        <View style={styles.btnRow}>
          <Pressable
            testID="budget-reset"
            onPress={onReset}
            style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Text style={[styles.btnText, { color: colors.onSurface }]}>Auto</Text>
          </Pressable>
          <Pressable
            testID="budget-save"
            onPress={onSave}
            style={[styles.btn, { backgroundColor: colors.brandPrimary, flex: 1 }]}
          >
            <Text style={[styles.btnText, { color: colors.onBrandPrimary }]}>
              {saved ? "Saved" : "Save targets"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BucketEditor({
  bucket,
  value,
  placeholder,
  onChange,
  spent,
  target,
  progress,
}: {
  bucket: Bucket;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  spent: number;
  target: number;
  progress: number;
}) {
  const { colors } = useTheme();
  const meta = BUCKET_META[bucket];
  const accent =
    bucket === "needs"
      ? colors.bucketNeeds
      : bucket === "wants"
      ? colors.bucketWants
      : colors.bucketSavings;
  const accentSoft =
    bucket === "needs"
      ? colors.bucketNeedsSoft
      : bucket === "wants"
      ? colors.bucketWantsSoft
      : colors.bucketSavingsSoft;

  return (
    <Card variant="secondary" style={{ marginTop: spacing.md }}>
      <View style={styles.bucketHeader}>
        <View style={[styles.bucketIcon, { backgroundColor: accentSoft }]}>
          <MaterialCommunityIcons
            name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={20}
            color={accent}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bucketName, { color: colors.onSurface }]}>{meta.label}</Text>
          <Text style={[styles.bucketDesc, { color: colors.info }]}>{meta.description}</Text>
        </View>
      </View>

      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <Text style={[styles.currencySign, { color: colors.onSurface }]}>₹</Text>
        <TextInput
          testID={`budget-input-${bucket}`}
          value={value}
          onChangeText={(v) => onChange(v.replace(/[^0-9.]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={colors.info}
          keyboardType="number-pad"
          style={[styles.input, { color: colors.onSurface }]}
        />
      </View>

      <View style={styles.bucketMeta}>
        <Text style={[styles.meta, { color: colors.info }]}>
          {bucket === "savings"
            ? `Saved ${formatINR(spent, { compact: true })} of ${formatINR(target, { compact: true })}`
            : `Spent ${formatINR(spent, { compact: true })} of ${formatINR(target, { compact: true })}`}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.surfaceTertiary }]}>
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: accent,
              borderRadius: radius.pill,
            }}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { fontSize: fontSize["2xl"], fontWeight: "500" },
  subtitle: { fontSize: fontSize.base, marginTop: 2 },
  label: { fontSize: fontSize.sm },
  bigAmount: { fontSize: 32, fontWeight: "500", marginTop: spacing.xs },
  helper: { fontSize: fontSize.sm, marginTop: spacing.sm },
  bucketHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  bucketIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  bucketName: { fontSize: fontSize.lg, fontWeight: "500" },
  bucketDesc: { fontSize: fontSize.sm, marginTop: 2 },
  inputRow: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, paddingVertical: 4 },
  currencySign: { fontSize: 24, fontWeight: "500", marginRight: spacing.sm },
  input: { flex: 1, fontSize: 24, fontWeight: "500", paddingVertical: spacing.sm },
  bucketMeta: { marginTop: spacing.md, gap: spacing.sm },
  meta: { fontSize: fontSize.sm },
  track: { height: 8, borderRadius: radius.pill, overflow: "hidden" },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  btn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.pill, alignItems: "center" },
  btnText: { fontSize: fontSize.base, fontWeight: "500" },
});
