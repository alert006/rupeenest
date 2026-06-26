import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bucket, CategoryKey, bucketOfCategory } from "../utils/categories";
import { isSameMonth } from "../utils/format";
import { deriveTargets, SmartBudget, SmartBudgetTotals } from "../utils/insights";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryKey;
  bucket?: Bucket; // explicit override; expenses without override use category default
  date: string; // ISO
  notes?: string;
  merchant?: string;
};

export type Prefs = {
  notificationsEnabled: boolean;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  isPremium: boolean;
};

type State = {
  hydrated: boolean;
  userName: string;
  monthlyBudget: number; // legacy single-budget, kept for back-compat
  smartBudget: SmartBudget; // overrides, 0 = auto
  transactions: Transaction[];
  prefs: Prefs;
};

type FinanceContextValue = State & {
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setMonthlyBudget: (amount: number) => Promise<void>;
  setSmartBudget: (b: SmartBudget) => Promise<void>;
  setPrefs: (patch: Partial<Prefs>) => Promise<void>;
  clearAll: () => Promise<void>;
  totals: {
    income: number;
    expenses: number;
    balance: number;
    savings: number;
    monthIncome: number;
    monthExpenses: number;
    monthBalance: number;
  };
  smartBudgetTotals: SmartBudgetTotals;
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

const KEY_TRANSACTIONS = "@rupeenest:transactions";
const KEY_USER = "@rupeenest:user";
const KEY_BUDGET = "@rupeenest:budget";
const KEY_SMART_BUDGET = "@rupeenest:smart-budget";
const KEY_PREFS = "@rupeenest:prefs";

const DEFAULT_PREFS: Prefs = {
  notificationsEnabled: false,
  pinEnabled: false,
  biometricEnabled: false,
  isPremium: false,
};

const DEFAULT_SMART: SmartBudget = { needs: 0, wants: 0, savings: 0 };

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function effectiveBucket(t: Transaction): Bucket | null {
  if (t.type !== "expense") return null;
  return t.bucket ?? bucketOfCategory(t.category);
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    hydrated: false,
    userName: "Friend",
    monthlyBudget: 0,
    smartBudget: DEFAULT_SMART,
    transactions: [],
    prefs: DEFAULT_PREFS,
  });

  useEffect(() => {
    (async () => {
      try {
        const [txRaw, userRaw, budgetRaw, smartRaw, prefsRaw] = await Promise.all([
          AsyncStorage.getItem(KEY_TRANSACTIONS),
          AsyncStorage.getItem(KEY_USER),
          AsyncStorage.getItem(KEY_BUDGET),
          AsyncStorage.getItem(KEY_SMART_BUDGET),
          AsyncStorage.getItem(KEY_PREFS),
        ]);
        setState({
          hydrated: true,
          userName: userRaw || "Friend",
          monthlyBudget: budgetRaw ? Number(budgetRaw) : 0,
          smartBudget: smartRaw ? { ...DEFAULT_SMART, ...JSON.parse(smartRaw) } : DEFAULT_SMART,
          transactions: txRaw ? JSON.parse(txRaw) : [],
          prefs: prefsRaw ? { ...DEFAULT_PREFS, ...JSON.parse(prefsRaw) } : DEFAULT_PREFS,
        });
      } catch {
        setState((s) => ({ ...s, hydrated: true }));
      }
    })();
  }, []);

  const persistTx = useCallback(async (tx: Transaction[]) => {
    await AsyncStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(tx));
  }, []);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    const next: Transaction = { ...t, id: uid() };
    setState((s) => {
      const transactions = [next, ...s.transactions];
      persistTx(transactions);
      return { ...s, transactions };
    });
  }, [persistTx]);

  const updateTransaction = useCallback(async (id: string, patch: Partial<Omit<Transaction, "id">>) => {
    setState((s) => {
      const transactions = s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t));
      persistTx(transactions);
      return { ...s, transactions };
    });
  }, [persistTx]);

  const deleteTransaction = useCallback(async (id: string) => {
    setState((s) => {
      const transactions = s.transactions.filter((t) => t.id !== id);
      persistTx(transactions);
      return { ...s, transactions };
    });
  }, [persistTx]);

  const setUserName = useCallback(async (name: string) => {
    setState((s) => ({ ...s, userName: name }));
    await AsyncStorage.setItem(KEY_USER, name);
  }, []);

  const setMonthlyBudget = useCallback(async (amount: number) => {
    setState((s) => ({ ...s, monthlyBudget: amount }));
    await AsyncStorage.setItem(KEY_BUDGET, String(amount));
  }, []);

  const setSmartBudget = useCallback(async (b: SmartBudget) => {
    setState((s) => ({ ...s, smartBudget: b }));
    await AsyncStorage.setItem(KEY_SMART_BUDGET, JSON.stringify(b));
  }, []);

  const setPrefs = useCallback(async (patch: Partial<Prefs>) => {
    setState((s) => {
      const next = { ...s.prefs, ...patch };
      AsyncStorage.setItem(KEY_PREFS, JSON.stringify(next));
      return { ...s, prefs: next };
    });
  }, []);

  const clearAll = useCallback(async () => {
    await AsyncStorage.removeItem(KEY_TRANSACTIONS);
    setState((s) => ({ ...s, transactions: [] }));
  }, []);

  const totals = useMemo(() => {
    let income = 0, expenses = 0, monthIncome = 0, monthExpenses = 0;
    const ref = new Date();
    for (const t of state.transactions) {
      if (t.type === "income") income += t.amount; else expenses += t.amount;
      if (isSameMonth(t.date, ref)) {
        if (t.type === "income") monthIncome += t.amount; else monthExpenses += t.amount;
      }
    }
    return {
      income,
      expenses,
      balance: income - expenses,
      savings: Math.max(0, income - expenses),
      monthIncome,
      monthExpenses,
      monthBalance: monthIncome - monthExpenses,
    };
  }, [state.transactions]);

  const smartBudgetTotals: SmartBudgetTotals = useMemo(() => {
    const ref = new Date();
    const spent = { needs: 0, wants: 0, savings: 0 };
    for (const t of state.transactions) {
      if (!isSameMonth(t.date, ref)) continue;
      const b = effectiveBucket(t);
      if (!b) continue;
      spent[b] += t.amount;
    }
    const targets = deriveTargets(totals.monthIncome, state.smartBudget);
    const remaining = {
      needs: Math.max(0, targets.needs - spent.needs),
      wants: Math.max(0, targets.wants - spent.wants),
      savings: Math.max(0, targets.savings - spent.savings),
    };
    const progress = {
      needs: targets.needs > 0 ? Math.min(1, spent.needs / targets.needs) : 0,
      wants: targets.wants > 0 ? Math.min(1, spent.wants / targets.wants) : 0,
      savings: targets.savings > 0 ? Math.min(1, spent.savings / targets.savings) : 0,
    };
    return {
      targets,
      spent,
      remaining,
      progress,
      totalTarget: targets.needs + targets.wants + targets.savings,
      totalSpent: spent.needs + spent.wants + spent.savings,
    };
  }, [state.transactions, state.smartBudget, totals.monthIncome]);

  const value = useMemo<FinanceContextValue>(() => ({
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setUserName,
    setMonthlyBudget,
    setSmartBudget,
    setPrefs,
    clearAll,
    totals,
    smartBudgetTotals,
  }), [
    state, addTransaction, updateTransaction, deleteTransaction,
    setUserName, setMonthlyBudget, setSmartBudget, setPrefs, clearAll,
    totals, smartBudgetTotals,
  ]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
