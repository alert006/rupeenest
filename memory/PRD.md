# RupeeNest - PRD

## Overview
RupeeNest is an offline-first personal finance mobile app (React Native / Expo) for the Indian market. Track income, expenses, budget, and reports — all stored locally on device.

**Version: 1.0.0** (release-ready)

## Features
- Dashboard: greeting, total balance, monthly income/expenses/savings, recent activity, budget progress, FAB to add transaction
- Add Transaction modal: amount (large numeric), Income/Expense segmented control, category chips, date picker (built-in mini calendar), merchant, notes
- Transactions: search, filter (all/income/expense), tap row to open detail bottom-sheet with Edit / Delete
- Budget: monthly budget edit, progress bar, predictive insight ("On track to save X / Overspending / Set a budget"), per-category breakdown
- Reports: KPI tiles, last-6-months income vs expenses bar chart, top spending categories with share bars
- Profile: avatar with initials, editable name, dark mode toggle, navigate to settings / about
- Settings: theme preference (system/light/dark), clear-all-data, about
- Bottom tabs (Home, Transactions, Budget, Reports, Profile) with iOS blur tab bar

## Release prep (v1.0.0)
- Demo/sample data removed; every new install starts empty
- Default user name "Friend", default monthly budget ₹0
- Proper empty states on Dashboard, Transactions, Budget, Reports
- App identifiers configured: bundleIdentifier/package `com.rupeenest.app`, versionCode 1, buildNumber 1
- Splash + Android adaptive-icon background set to brand teal `#056C5A` (dark splash `#0F1714`)
- FAB shadow updated to RN's modern `boxShadow` (deprecation cleared)
- Lint clean (`expo lint`)

## Stack
- Expo Router, React Native, TypeScript
- Context API (ThemeContext, FinanceContext)
- AsyncStorage for persistence
- expo-linear-gradient, expo-blur, expo-haptics, react-native-reanimated, MaterialCommunityIcons
- Material 3 inspired teal & emerald design from `/app/design_guidelines.json`

## Storage Keys
- `@rupeenest:transactions` — full transaction list
- `@rupeenest:user` — user name
- `@rupeenest:budget` — monthly budget
- `@rupeenest:theme-mode` — light/dark/system

No backend, no auth, no API.
