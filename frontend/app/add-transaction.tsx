import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Chip } from "@/src/components/Chip";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { categoriesFor, CategoryKey } from "@/src/utils/categories";
import { formatDate } from "@/src/utils/format";

type TxType = "income" | "expense";

export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { transactions, addTransaction, updateTransaction } = useFinance();

  const existing = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);

  const [type, setType] = useState<TxType>(existing?.type ?? "expense");
  const [amount, setAmount] = useState(existing ? String(existing.amount) : "");
  const [category, setCategory] = useState<CategoryKey>(existing?.category ?? "food");
  const [merchant, setMerchant] = useState(existing?.merchant ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [date, setDate] = useState<Date>(existing ? new Date(existing.date) : new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCategories = useMemo(() => categoriesFor(type), [type]);

  const onSave = async () => {
    const n = Number(amount.replace(/[^0-9.]/g, ""));
    if (!n || n <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    const payload = {
      amount: n,
      type,
      category,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      date: date.toISOString(),
    };
    if (existing) {
      await updateTransaction(existing.id, payload);
    } else {
      await addTransaction(payload);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            testID="add-tx-close"
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {existing ? "Edit transaction" : "Add transaction"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.segment, { backgroundColor: colors.surfaceSecondary }]}>
            {(["expense", "income"] as TxType[]).map((t) => (
              <Pressable
                key={t}
                testID={`segment-${t}`}
                onPress={() => {
                  setType(t);
                  const cats = categoriesFor(t);
                  if (!cats.find((c) => c.key === category)) setCategory(cats[0].key);
                }}
                style={[
                  styles.segmentItem,
                  type === t && { backgroundColor: colors.brandPrimary },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: type === t ? colors.onBrandPrimary : colors.onSurface },
                  ]}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.info }]}>Amount</Text>
          <View style={[styles.amountRow, { borderColor: colors.border }]}>
            <Text style={[styles.currencySign, { color: colors.onSurface }]}>₹</Text>
            <TextInput
              testID="amount-input"
              value={amount}
              onChangeText={(v) => {
                setAmount(v.replace(/[^0-9.]/g, ""));
                if (error) setError(null);
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.info}
              style={[styles.amountInput, { color: colors.onSurface }]}
            />
          </View>
          {error ? (
            <Text style={[styles.error, { color: colors.error }]} testID="amount-error">
              {error}
            </Text>
          ) : null}

          <Text style={[styles.label, { color: colors.info, marginTop: spacing.lg }]}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.xs }}
          >
            {availableCategories.map((c) => (
              <Chip
                key={c.key}
                testID={`cat-${c.key}`}
                label={c.label}
                icon={c.icon as any}
                selected={category === c.key}
                onPress={() => setCategory(c.key)}
              />
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: colors.info, marginTop: spacing.lg }]}>Merchant (optional)</Text>
          <TextInput
            testID="merchant-input"
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Starbucks"
            placeholderTextColor={colors.info}
            style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceSecondary }]}
          />

          <Text style={[styles.label, { color: colors.info, marginTop: spacing.lg }]}>Date</Text>
          <Pressable
            testID="date-toggle"
            onPress={() => setShowCalendar((v) => !v)}
            style={[styles.input, { backgroundColor: colors.surfaceSecondary, justifyContent: "center" }]}
          >
            <Text style={{ color: colors.onSurface, fontSize: fontSize.base }}>{formatDate(date.toISOString())}</Text>
          </Pressable>
          {showCalendar ? (
            <MiniCalendar value={date} onChange={(d) => { setDate(d); setShowCalendar(false); }} />
          ) : null}

          <Text style={[styles.label, { color: colors.info, marginTop: spacing.lg }]}>Notes (optional)</Text>
          <TextInput
            testID="notes-input"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note"
            placeholderTextColor={colors.info}
            multiline
            style={[
              styles.input,
              styles.notes,
              { color: colors.onSurface, backgroundColor: colors.surfaceSecondary },
            ]}
          />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
          <Pressable
            testID="save-transaction-btn"
            onPress={onSave}
            style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
          >
            <Text style={[styles.saveText, { color: colors.onBrandPrimary }]}>
              {existing ? "Save changes" : "Save transaction"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MiniCalendar({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const { colors } = useTheme();
  const [view, setView] = useState(new Date(value.getFullYear(), value.getMonth(), 1));
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={[styles.calendar, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={styles.calHeader}>
        <Pressable onPress={() => setView(new Date(year, month - 1, 1))} testID="cal-prev">
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={{ color: colors.onSurface, fontSize: fontSize.base, fontWeight: "500" }}>
          {view.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </Text>
        <Pressable onPress={() => setView(new Date(year, month + 1, 1))} testID="cal-next">
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onSurface} />
        </Pressable>
      </View>
      <View style={styles.weekRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text key={i} style={[styles.weekDay, { color: colors.info }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {cells.map((d, i) => {
          if (d === null) return <View key={i} style={styles.day} />;
          const isSelected =
            value.getDate() === d && value.getMonth() === month && value.getFullYear() === year;
          return (
            <Pressable
              key={i}
              testID={`day-${d}`}
              onPress={() => onChange(new Date(year, month, d))}
              style={[
                styles.day,
                isSelected && { backgroundColor: colors.brandPrimary, borderRadius: 16 },
              ]}
            >
              <Text
                style={{
                  color: isSelected ? colors.onBrandPrimary : colors.onSurface,
                  fontSize: fontSize.base,
                }}
              >
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  segment: {
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  segmentText: { fontSize: fontSize.base, fontWeight: "500" },
  label: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  currencySign: { fontSize: 32, fontWeight: "500", marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: 36, fontWeight: "500" },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    fontSize: fontSize.base,
  },
  notes: { minHeight: 80, textAlignVertical: "top", paddingTop: spacing.md },
  error: { fontSize: fontSize.sm, marginTop: spacing.xs },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  saveText: { fontSize: fontSize.lg, fontWeight: "500" },
  calendar: { marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  calHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  weekRow: { flexDirection: "row" },
  weekDay: { flex: 1, textAlign: "center", fontSize: fontSize.sm, paddingVertical: spacing.xs },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  day: { width: `${100 / 7}%`, height: 36, alignItems: "center", justifyContent: "center" },
});
