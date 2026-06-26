import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";

const FEATURES: { icon: keyof typeof import("@expo/vector-icons/build/MaterialCommunityIcons").default.glyphMap; title: string; sub: string }[] = [
  { icon: "account-group-outline", title: "Invite up to 6 members", sub: "Add partner, parents, or kids" },
  { icon: "view-dashboard-outline", title: "Shared Dashboard", sub: "Everyone sees one source of truth" },
  { icon: "swap-horizontal", title: "Shared Expenses", sub: "Track who paid for what" },
  { icon: "target", title: "Shared Savings Goals", sub: "Vacation, home, education" },
  { icon: "chart-pie", title: "Family Analytics", sub: "Insights across the household" },
  { icon: "cloud-sync-outline", title: "Cloud Sync", sub: "Always up to date on every device" },
];

export default function PremiumScreen() {
  const { colors, isDark } = useTheme();
  const { prefs, setPrefs } = useFinance();
  const router = useRouter();

  const onUpgrade = (plan: "monthly" | "yearly") => {
    Alert.alert(
      prefs.isPremium ? "Manage Premium" : `Upgrade to RupeeNest Premium`,
      prefs.isPremium
        ? "Premium is currently active on this device."
        : `Activate the ${plan === "monthly" ? "₹99/month" : "₹699/year"} plan for Family Budget?`,
      prefs.isPremium
        ? [{ text: "Done", style: "default" }]
        : [
            { text: "Maybe later", style: "cancel" },
            {
              text: "Activate",
              onPress: () => setPrefs({ isPremium: true }),
            },
          ],
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Pressable
          testID="premium-back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: Platform.OS === "ios" ? 60 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={
            isDark
              ? [colors.brandTertiary, colors.surfaceSecondary]
              : [colors.brandPrimary, colors.brandSecondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="star-four-points" size={14} color={colors.brandPrimary} />
            <Text style={[styles.heroBadgeText, { color: colors.brandPrimary }]}>Family Budget</Text>
          </View>
          <Text style={[styles.heroTitle, { color: isDark ? colors.onBrandTertiary : colors.onBrandPrimary }]}>
            Money management for the whole family.
          </Text>
          <Text style={[styles.heroSub, { color: isDark ? colors.onBrandTertiary : colors.onBrandPrimary, opacity: 0.9 }]}>
            Everything else in RupeeNest stays free, forever.
          </Text>
        </LinearGradient>

        <Card variant="secondary" style={{ marginTop: spacing.lg }} padding="md" testID="premium-features-card">
          {FEATURES.map((f, i) => (
            <View
              key={f.title}
              style={[
                styles.feature,
                i < FEATURES.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.divider,
                },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.brandTertiary }]}>
                <MaterialCommunityIcons name={f.icon} size={20} color={colors.onBrandTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.onSurface }]}>{f.title}</Text>
                <Text style={[styles.featureSub, { color: colors.info }]}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.planRow}>
          <PlanCard
            testID="plan-monthly"
            title="Monthly"
            price="₹99"
            cadence="/month"
            footnote="Cancel anytime"
            cta={prefs.isPremium ? "Active" : "Upgrade"}
            active={prefs.isPremium}
            onPress={() => onUpgrade("monthly")}
          />
          <PlanCard
            testID="plan-yearly"
            title="Yearly"
            price="₹699"
            cadence="/year"
            footnote="Save ₹489 vs monthly"
            cta={prefs.isPremium ? "Active" : "Upgrade"}
            active={prefs.isPremium}
            highlight
            onPress={() => onUpgrade("yearly")}
          />
        </View>

        <Text style={[styles.fineprint, { color: colors.info }]}>
          Family Budget is the only paid feature. Smart Budget, Insights, Notifications, PIN/Fingerprint Lock, Backup, PDF
          & Excel export remain free for everyone.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({
  testID,
  title,
  price,
  cadence,
  footnote,
  cta,
  highlight,
  active,
  onPress,
}: {
  testID: string;
  title: string;
  price: string;
  cadence: string;
  footnote: string;
  cta: string;
  highlight?: boolean;
  active?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[
        styles.plan,
        {
          backgroundColor: highlight ? colors.brandPrimary : colors.surfaceSecondary,
          borderColor: highlight ? colors.brandPrimary : colors.border,
        },
      ]}
    >
      <Text style={[styles.planTitle, { color: highlight ? colors.onBrandPrimary : colors.onSurface }]}>
        {title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: highlight ? colors.onBrandPrimary : colors.onSurface }]}>
          {price}
        </Text>
        <Text
          style={[styles.cadence, { color: highlight ? colors.onBrandPrimary : colors.info, opacity: 0.85 }]}
        >
          {cadence}
        </Text>
      </View>
      <Text style={[styles.footnote, { color: highlight ? colors.onBrandPrimary : colors.info, opacity: 0.85 }]}>
        {footnote}
      </Text>
      <View
        style={[
          styles.cta,
          {
            backgroundColor: highlight ? colors.surface : colors.brandPrimary,
          },
        ]}
      >
        <Text
          style={[
            styles.ctaText,
            { color: highlight ? colors.brandPrimary : colors.onBrandPrimary },
          ]}
        >
          {active ? "Active" : cta}
        </Text>
      </View>
    </Pressable>
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
  hero: { borderRadius: radius.lg, padding: spacing.xl },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  heroBadgeText: { fontSize: fontSize.sm, fontWeight: "500" },
  heroTitle: { fontSize: 24, fontWeight: "500", letterSpacing: -0.3 },
  heroSub: { fontSize: fontSize.base, marginTop: spacing.sm },
  feature: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  featureIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: fontSize.base, fontWeight: "500" },
  featureSub: { fontSize: fontSize.sm, marginTop: 2 },
  planRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  plan: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 4,
  },
  planTitle: { fontSize: fontSize.base, fontWeight: "500" },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: spacing.xs },
  price: { fontSize: 28, fontWeight: "500" },
  cadence: { fontSize: fontSize.sm, marginLeft: 4 },
  footnote: { fontSize: fontSize.sm, marginTop: 2 },
  cta: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  ctaText: { fontSize: fontSize.base, fontWeight: "500" },
  fineprint: { fontSize: fontSize.sm, marginTop: spacing.lg, lineHeight: 20 },
});
