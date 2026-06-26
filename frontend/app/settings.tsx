import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/src/theme/ThemeContext";
import { useFinance } from "@/src/context/FinanceContext";
import { Card } from "@/src/components/Card";
import { spacing, radius, fontSize } from "@/src/theme/colors";
import { exportTransactionsPDF, exportTransactionsCSV, exportBackupJSON } from "@/src/utils/exports";
import { enableDailyReminder, disableReminder } from "@/src/utils/notifications";
import { biometricAvailable, authenticateBiometric, hasPin, clearPin } from "@/src/utils/security";

export default function SettingsScreen() {
  const { colors, isDark, toggle, mode, setMode } = useTheme();
  const { transactions, userName, smartBudget, prefs, setPrefs, clearAll } = useFinance();
  const router = useRouter();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [pinSet, setPinSet] = useState(false);

  useEffect(() => {
    biometricAvailable().then(setBioAvailable);
    hasPin().then(setPinSet);
  }, []);

  const refreshPin = () => hasPin().then(setPinSet);

  const onToggleNotifications = async (value: boolean) => {
    if (value) {
      const ok = await enableDailyReminder();
      if (!ok) {
        Alert.alert(
          "Notifications unavailable",
          Platform.OS === "web"
            ? "Open RupeeNest on iOS or Android to enable daily reminders."
            : "Permission was denied. You can enable notifications from system Settings."
        );
        return;
      }
    } else {
      await disableReminder();
    }
    setPrefs({ notificationsEnabled: value });
  };

  const onTogglePin = async (value: boolean) => {
    if (value) {
      router.push("/pin-setup");
    } else {
      if (Platform.OS !== "web") await clearPin();
      setPrefs({ pinEnabled: false, biometricEnabled: false });
      refreshPin();
    }
  };

  const onToggleBiometric = async (value: boolean) => {
    if (value) {
      if (!pinSet) {
        Alert.alert("Set a PIN first", "Enable PIN Lock before turning on Fingerprint.");
        return;
      }
      const ok = await authenticateBiometric("Enable Fingerprint for RupeeNest");
      if (!ok) {
        Alert.alert("Authentication cancelled", "Fingerprint was not verified.");
        return;
      }
    }
    setPrefs({ biometricEnabled: value });
  };

  const onBackup = async () => {
    await exportBackupJSON({
      version: 2,
      exportedAt: new Date().toISOString(),
      userName,
      smartBudget,
      transactions,
    });
  };

  const onPDF = () => exportTransactionsPDF(transactions, userName);
  const onCSV = () => exportTransactionsCSV(transactions);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Pressable
          testID="settings-back"
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: Platform.OS === "ios" ? 60 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE */}
        <SectionLabel text="Profile" />
        <Card variant="secondary" padding="md">
          <Pressable
            testID="settings-profile-row"
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.row}
          >
            <RowIcon icon="account-circle-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{userName}</Text>
              <Text style={[styles.rowSub, { color: colors.info }]}>Edit name & avatar</Text>
            </View>
            <Chevron />
          </Pressable>
        </Card>

        {/* APPEARANCE */}
        <SectionLabel text="Theme" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="theme-light-dark" />
            <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]}>Dark Mode</Text>
            <Switch
              testID="settings-dark-toggle"
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor={colors.surface}
            />
          </View>
          <Divider />
          <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
            <Text style={{ color: colors.onSurface, fontSize: fontSize.base, fontWeight: "500" }}>
              Theme preference
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {(["system", "light", "dark"] as const).map((m) => (
                <Pressable
                  key={m}
                  testID={`theme-${m}`}
                  onPress={() => setMode(m)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: mode === m ? colors.brandPrimary : colors.surface,
                      borderColor: mode === m ? colors.brandPrimary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: mode === m ? colors.onBrandPrimary : colors.onSurface,
                      fontSize: fontSize.sm,
                      fontWeight: "500",
                      textTransform: "capitalize",
                    }}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        {/* CURRENCY */}
        <SectionLabel text="Currency" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="currency-inr" />
            <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]}>Currency</Text>
            <Text style={{ color: colors.info, fontSize: fontSize.base }}>Indian Rupee (₹)</Text>
          </View>
        </Card>

        {/* NOTIFICATIONS */}
        <SectionLabel text="Notifications" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="bell-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>Daily reminder</Text>
              <Text style={[styles.rowSub, { color: colors.info }]}>Nudge at 8 pm to log spending</Text>
            </View>
            <Switch
              testID="notifications-toggle"
              value={prefs.notificationsEnabled}
              onValueChange={onToggleNotifications}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* SECURITY */}
        <SectionLabel text="Security" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="lock-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>PIN Lock</Text>
              <Text style={[styles.rowSub, { color: colors.info }]}>
                {pinSet ? "4-digit PIN set" : "Protect your data with a 4-digit PIN"}
              </Text>
            </View>
            <Switch
              testID="pin-toggle"
              value={prefs.pinEnabled && pinSet}
              onValueChange={onTogglePin}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor={colors.surface}
            />
          </View>
          <Divider />
          <View style={styles.row}>
            <RowIcon icon="fingerprint" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>Fingerprint Lock</Text>
              <Text style={[styles.rowSub, { color: colors.info }]}>
                {bioAvailable ? "Use biometrics to unlock" : "Not available on this device"}
              </Text>
            </View>
            <Switch
              testID="biometric-toggle"
              value={prefs.biometricEnabled}
              onValueChange={onToggleBiometric}
              disabled={!bioAvailable}
              trackColor={{ false: colors.surfaceTertiary, true: colors.brandPrimary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* BACKUP & EXPORT */}
        <SectionLabel text="Backup" />
        <Card variant="secondary" padding="md">
          <RowButton
            testID="backup-json-btn"
            icon="cloud-upload-outline"
            label="Backup to Cloud"
            sub="Save a snapshot to your cloud drive"
            onPress={onBackup}
          />
          <Divider />
          <RowButton
            testID="export-pdf-btn"
            icon="file-pdf-box"
            label="Export PDF"
            sub="Printable transaction report"
            onPress={onPDF}
          />
          <Divider />
          <RowButton
            testID="export-csv-btn"
            icon="file-excel-box"
            label="Export Excel (CSV)"
            sub="Open in Excel, Numbers, or Sheets"
            onPress={onCSV}
          />
        </Card>

        {/* PREMIUM */}
        <SectionLabel text="Premium" />
        <Card variant="secondary" padding="md">
          <Pressable
            testID="settings-premium-row"
            onPress={() => router.push("/premium")}
            style={styles.row}
          >
            <RowIcon icon="star-four-points-outline" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.onSurface }]}>Family Budget</Text>
              <Text style={[styles.rowSub, { color: colors.info }]}>
                {prefs.isPremium ? "Active" : "₹99/month · ₹699/year"}
              </Text>
            </View>
            <Chevron />
          </Pressable>
        </Card>

        {/* DATA */}
        <SectionLabel text="Data" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="database-outline" />
            <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]}>
              {transactions.length} transactions stored locally
            </Text>
          </View>
          <Divider />
          <Pressable
            testID="clear-data-btn"
            onPress={() =>
              Alert.alert(
                "Clear all data?",
                "This will remove all transactions saved on this device.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: () => clearAll() },
                ],
              )
            }
            style={styles.row}
          >
            <RowIcon icon="trash-can-outline" tint={colors.error} />
            <Text style={[styles.rowLabel, { color: colors.error }]}>Clear all transactions</Text>
          </Pressable>
        </Card>

        {/* ABOUT */}
        <SectionLabel text="About" />
        <Card variant="secondary" padding="md">
          <View style={styles.row}>
            <RowIcon icon="information-outline" />
            <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]}>RupeeNest</Text>
            <Text style={{ color: colors.info, fontSize: fontSize.base }}>v2.0.0</Text>
          </View>
          <Divider />
          <View style={{ paddingVertical: spacing.md, gap: spacing.xs }}>
            <Text style={{ color: colors.onSurface, fontSize: fontSize.base, fontWeight: "500" }}>
              Simple Budget. Better Life.
            </Text>
            <Text style={{ color: colors.info, fontSize: fontSize.sm, lineHeight: 20 }}>
              RupeeNest helps you build better money habits through a Smart Budget system. All data lives on your device.
            </Text>
          </View>
          <Divider />
          <View style={styles.row}>
            <RowIcon icon="shield-lock-outline" />
            <Text style={[styles.rowLabel, { color: colors.onSurface, flex: 1 }]}>Privacy</Text>
            <Text style={{ color: colors.info, fontSize: fontSize.base }}>Local only</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.section, { color: colors.info }]}>{text}</Text>
  );
}

function RowIcon({
  icon,
  tint,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tint?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.rowIcon, { backgroundColor: colors.brandTertiary }]}>
      <MaterialCommunityIcons name={icon} size={20} color={tint ?? colors.onBrandTertiary} />
    </View>
  );
}

function Chevron() {
  const { colors } = useTheme();
  return <MaterialCommunityIcons name="chevron-right" size={22} color={colors.info} />;
}

function RowButton({
  icon,
  label,
  sub,
  onPress,
  testID,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.row}>
      <RowIcon icon={icon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.onSurface }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.info }]}>{sub}</Text> : null}
      </View>
      <Chevron />
    </Pressable>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginLeft: 52 }} />;
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
  section: {
    fontSize: fontSize.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, gap: spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: fontSize.base, fontWeight: "500" },
  rowSub: { fontSize: fontSize.sm, marginTop: 2 },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
