import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";

export default function ProfileScreen() {
  const { colors, isDark, toggle } = useTheme();
  const { userName, setUserName, transactions } = useFinance();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(userName);

  const initials = (userName || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 120 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.brandPrimary, colors.brandSecondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
            <Text style={[styles.avatarText, { color: colors.brandPrimary }]}>{initials}</Text>
          </View>
        </LinearGradient>

        <View style={styles.nameWrap}>
          {editing ? (
            <View style={[styles.nameEditRow, { borderColor: colors.border }]}>
              <TextInput
                testID="profile-name-input"
                value={draft}
                onChangeText={setDraft}
                style={[styles.nameInput, { color: colors.onSurface }]}
                placeholder="Your name"
                placeholderTextColor={colors.info}
                autoFocus
              />
              <Pressable
                testID="profile-name-save"
                onPress={() => {
                  setUserName(draft.trim() || "User");
                  setEditing(false);
                }}
                style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
              >
                <Text style={{ color: colors.onBrandPrimary, fontWeight: "500" }}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              testID="profile-name-edit"
              onPress={() => {
                setDraft(userName);
                setEditing(true);
              }}
              style={styles.nameRow}
            >
              <Text style={[styles.name, { color: colors.onSurface }]}>{userName}</Text>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.info} />
            </Pressable>
          )}
          <Text style={[styles.subtitle, { color: colors.info }]}>
            {transactions.length} transactions logged
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.lg }}>
          <Card variant="secondary" padding="md">
            <Row
              icon="theme-light-dark"
              label="Dark Mode"
              right={
                <Switch
                  testID="dark-mode-toggle"
                  value={isDark}
                  onValueChange={toggle}
                  trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
                  thumbColor={colors.surface}
                />
              }
            />
            <Divider />
            <RowButton
              testID="goto-settings"
              icon="cog-outline"
              label="Settings"
              onPress={() => router.push("/settings")}
            />
            <Divider />
            <RowButton
              testID="about-app"
              icon="information-outline"
              label="About RupeeNest"
              onPress={() => router.push({ pathname: "/settings", params: { section: "about" } })}
            />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, right }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; right: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: colors.brandTertiary }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.onBrandTertiary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</Text>
      <View style={{ marginLeft: "auto" }}>{right}</View>
    </View>
  );
}

function RowButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: colors.brandTertiary }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.onBrandTertiary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.info}
        style={{ marginLeft: "auto" }}
      />
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: 52 }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  banner: {
    height: 160,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -48,
  },
  avatarText: { fontSize: 36, fontWeight: "500" },
  nameWrap: { alignItems: "center", marginTop: 64, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: fontSize["2xl"], fontWeight: "500" },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
    width: "80%",
  },
  nameInput: { flex: 1, fontSize: fontSize.xl, fontWeight: "500", paddingVertical: spacing.xs },
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  subtitle: { fontSize: fontSize.sm, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: fontSize.base, fontWeight: "500" },
});
