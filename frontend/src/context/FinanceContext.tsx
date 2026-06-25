import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CategoryKey } from "../utils/categories";
import { isSameMonth } from "../utils/format";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryKey;
  date: string; // ISO
  notes?: string;
  merchant?: string;
};

type State = {
  hydrated: boolean;
  userName: string;
  monthlyBudget: number;
  transactions: Transaction[];
};

type FinanceContextValue = State & {
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, "id">>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setUserName: (name: string) => Promise<void>;
  setMonthlyBudget: (amount: number) => Promise<void>;
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
};

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

const KEY_TRANSACTIONS = "@rupeenest:transactions";
const KEY_USER = "@rupeenest:user";
const KEY_BUDGET = "@rupeenest:budget";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    hydrated: false,
    userName: "Friend",
    monthlyBudget: 0,
    transactions: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [txRaw, userRaw, budgetRaw] = await Promise.all([
          AsyncStorage.getItem(KEY_TRANSACTIONS),
          AsyncStorage.getItem(KEY_USER),
          AsyncStorage.getItem(KEY_BUDGET),
        ]);
        const transactions: Transaction[] = txRaw ? JSON.parse(txRaw) : [];
        setState({
          hydrated: true,
          userName: userRaw || "Friend",
          monthlyBudget: budgetRaw ? Number(budgetRaw) : 0,
          transactions,
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

  const value = useMemo<FinanceContextValue>(() => ({
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setUserName,
    setMonthlyBudget,
    clearAll,
    totals,
  }), [state, addTransaction, updateTransaction, deleteTransaction, setUserName, setMonthlyBudget, clearAll, totals]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
