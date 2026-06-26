# RupeeNest — PRD

## Identity
- **App:** RupeeNest
- **Tagline:** Simple Budget. Better Life.
- **Mission:** Help people build better money habits through a Smart Budget system.
- **Version:** 2.0.0 (versionCode 2, iOS buildNumber 2)
- **Package / Bundle:** com.rupeenest.app

## Stack
- Expo Router + React Native + TypeScript
- Context API (ThemeContext, FinanceContext)
- AsyncStorage persistence (offline-first, no backend, no auth, no API)
- expo-linear-gradient, expo-blur, expo-haptics, react-native-reanimated
- expo-notifications, expo-local-authentication (PIN/Fingerprint)
- expo-print, expo-sharing, expo-file-system (PDF / CSV / JSON export)
- expo-secure-store (PIN hash)

## Navigation
- Bottom tabs: **Home, Transactions, Budget, Insights, Profile** (5).
- Stack screens: `/add-transaction` (modal), `/settings`, `/premium`, `/pin-setup` (modal).

## Screens

### Dashboard
Greeting, Current Balance, monthly Income / Expenses / Savings, then **Smart Budget** (three premium cards):
- 🟢 **Needs** — Rent, Groceries, Electricity, Water, Fuel, Medical, Education, Internet
- 🔵 **Wants** — Food, Movies, Shopping, Coffee, Travel, Entertainment
- 🟣 **Savings** — Emergency Fund, SIP, Gold, Fixed Deposit

Each card: Target / Spent / Remaining / progress bar.

**Smart Insight** card below — one dynamic recommendation (e.g. "Great job! You are within budget.", "You are spending more than usual on Wants.", "You are close to reaching your savings goal.")

Recent Activity (last 6) and FAB to add transactions.

### Add Transaction
Amount (₹), Income/Expense segment, **Smart Budget bucket override chips** (auto-classifies from category, user can override), Category chips, Date, Merchant, Notes. Edit & Delete supported via Transactions sheet.

### Transactions
List with search + filter (All / Income / Expense). Tap row → Edit / Delete bottom sheet.

### Budget (Smart Budget editor)
Per-bucket targets — leave blank to auto-derive from monthly income, or enter custom amounts. Save / Auto reset.

### Insights (formerly Reports)
KPI tiles (Income / Expenses / Net) • **Budget Score 0–100** • Category Breakdown (by bucket) • Income vs Expenses 6-month chart • Top Spending Categories • Smart Insight.

### Premium
Only ONE paid feature — **Family Budget** (invite up to 6, shared dashboard / expenses / savings goals, family analytics, cloud sync). ₹99/month or ₹699/year. Upgrade buttons activate Premium state locally (payment gateway intentionally not wired).

### Profile
Editable name, avatar with initials, dark mode toggle, links to Settings / About.

### Settings
Profile · Theme (dark mode + system/light/dark) · Currency (₹) · Notifications (daily reminder via `expo-notifications`) · Security (PIN Lock via `expo-secure-store`, Fingerprint via `expo-local-authentication`) · Backup (Cloud JSON, PDF, Excel/CSV — share-sheet on device, alert on web) · Premium · Data (clear all) · About (v2.0.0).

## Internal Logic (never exposed in UI)
- Smart Budget auto-targets when user hasn't set custom values: 50% Needs / 30% Wants / 20% Savings of current month income.
- Budget Score: weighted average of staying-within-target on Needs (30%) + Wants (30%) + meeting Savings goal (40%), scaled to 0–100.
- Bucket auto-classify driven by `bucket` field on each category definition.

## Theme
White-and-blue Material 3 inspired palette. Brand `#2563EB` (light) / `#60A5FA` (dark). Bucket accents: Needs blue, Wants amber, Savings violet. No greens.

## Storage Keys
- `@rupeenest:transactions`
- `@rupeenest:user`
- `@rupeenest:budget` (legacy single budget, retained for back-compat)
- `@rupeenest:smart-budget` (Needs/Wants/Savings overrides)
- `@rupeenest:prefs` (notifications, pin, biometric, isPremium)
- `@rupeenest:theme-mode`
- SecureStore: `rupeenest_pin_hash`

## Free vs Paid
Free forever: Smart Budget · Dashboard · Transactions · Insights · Notifications · Cloud Backup · PIN Lock · Fingerprint Lock · PDF Export · Excel Export.
Paid (only): **Family Budget**.
