import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { spacing, radius, fontSize } from "../theme/colors";
import { Transaction } from "../context/FinanceContext";
import { formatINR, formatDateShort } from "../utils/format";
import { getCategory } from "../utils/categories";

type Props = {
  transaction: Transaction;
  onPress?: () => void;
  testID?: string;
};

export function TransactionRow({ transaction, onPress, testID }: Props) {
  const { colors } = useTheme();
  const cat = getCategory(transaction.category);
  const isIncome = transaction.type === "income";
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.surfaceTertiary : "transparent" },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.brandTertiary }]}>
        <MaterialCommunityIcons
          name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={22}
          color={colors.onBrandTertiary}
        />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
          {transaction.merchant || cat.label}
        </Text>
        <Text style={[styles.sub, { color: colors.info }]} numberOfLines={1}>
          {cat.label} • {formatDateShort(transaction.date)}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isIncome ? colors.success : colors.onSurface },
        ]}
      >
        {isIncome ? "+" : "-"}{formatINR(transaction.amount).replace("-", "")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: { flex: 1, marginHorizontal: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: "500" },
  sub: { fontSize: fontSize.sm, marginTop: 2 },
  amount: { fontSize: fontSize.lg, fontWeight: "500" },
});
