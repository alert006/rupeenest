import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance, Transaction } from "@/src/context/FinanceContext";
import { Chip } from "@/src/components/Chip";
import { TransactionRow } from "@/src/components/TransactionRow";
import { EmptyState } from "@/src/components/EmptyState";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { formatINR, formatDate, formatTime } from "@/src/utils/format";
import { getCategory } from "@/src/utils/categories";

type FilterKey = "all" | "income" | "expense";

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { transactions, deleteTransaction } = useFinance();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (filter !== "all" && t.type !== filter) return false;
        if (!q) return true;
        const cat = getCategory(t.category).label.toLowerCase();
        return (
          (t.merchant || "").toLowerCase().includes(q) ||
          cat.includes(q) ||
          (t.notes || "").toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filter, query]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Transactions</Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surfaceSecondary }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.info} />
        <TextInput
          testID="search-input"
          placeholder="Search transactions"
          placeholderTextColor={colors.info}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.onSurface }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} testID="search-clear">
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.info} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chipsRow}>
        {(["all", "income", "expense"] as FilterKey[]).map((k) => (
          <View key={k} style={{ marginRight: spacing.sm }}>
            <Chip
              testID={`filter-${k}`}
              label={k === "all" ? "All" : k === "income" ? "Income" : "Expenses"}
              selected={filter === k}
              onPress={() => setFilter(k)}
            />
          </View>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="text-search"
          title="No transactions found"
          message={query ? "Try a different search term." : "Add a transaction to see it here."}
        />
      ) : (
        <FlatList
          testID="transactions-list"
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: Platform.OS === "ios" ? 120 : 100,
          }}
          ItemSeparatorComponent={() => (
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          )}
          renderItem={({ item, index }) => (
            <TransactionRow
              transaction={item}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setSelected(item);
              }}
              testID={`tx-row-${index}`}
            />
          )}
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          {selected ? (
            <>
              <View style={styles.sheetHeader}>
                <View
                  style={[styles.sheetIcon, { backgroundColor: colors.brandTertiary }]}
                >
                  <MaterialCommunityIcons
                    name={getCategory(selected.category).icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={26}
                    color={colors.onBrandTertiary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.sheetTitle, { color: colors.onSurface }]} numberOfLines={1}>
                    {selected.merchant || getCategory(selected.category).label}
                  </Text>
                  <Text style={[styles.sheetSub, { color: colors.info }]}>
                    {getCategory(selected.category).label}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sheetAmount,
                    { color: selected.type === "income" ? colors.success : colors.onSurface },
                  ]}
                >
                  {selected.type === "income" ? "+" : "-"}
                  {formatINR(selected.amount).replace("-", "")}
                </Text>
              </View>

              <DetailRow label="Date" value={formatDate(selected.date)} />
              <DetailRow label="Time" value={formatTime(selected.date)} />
              <DetailRow label="Type" value={selected.type === "income" ? "Income" : "Expense"} />
              {selected.notes ? <DetailRow label="Notes" value={selected.notes} /> : null}

              <View style={styles.sheetActions}>
                <Pressable
                  testID="tx-edit-btn"
                  style={[styles.actionBtn, { backgroundColor: colors.brandPrimary }]}
                  onPress={() => {
                    const id = selected.id;
                    setSelected(null);
                    router.push({ pathname: "/add-transaction", params: { id } });
                  }}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.onBrandPrimary} />
                  <Text style={[styles.actionText, { color: colors.onBrandPrimary }]}>Edit</Text>
                </Pressable>
                <Pressable
                  testID="tx-delete-btn"
                  style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => {
                    const id = selected.id;
                    Alert.alert(
                      "Delete transaction?",
                      "This action cannot be undone.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => {
                            deleteTransaction(id);
                            setSelected(null);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>
      </Modal>

      <Pressable
        testID="transactions-fab"
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

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.info }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.onSurface }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { fontSize: fontSize["2xl"], fontWeight: "500" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: fontSize.base },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
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
    elevation: 6,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  sheetIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: "500" },
  sheetSub: { fontSize: fontSize.sm, marginTop: 2 },
  sheetAmount: { fontSize: fontSize.xl, fontWeight: "500" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  detailLabel: { fontSize: fontSize.base },
  detailValue: { fontSize: fontSize.base, fontWeight: "500", maxWidth: "60%", textAlign: "right" },
  sheetActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: fontSize.base, fontWeight: "500" },
});
