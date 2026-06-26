import { Bucket } from "./categories";

export type SmartBudget = {
  // Targets in INR for current month. 0 = auto (derive from income).
  needs: number;
  wants: number;
  savings: number;
};

export type SmartBudgetTotals = {
  targets: { needs: number; wants: number; savings: number };
  spent: { needs: number; wants: number; savings: number };
  remaining: { needs: number; wants: number; savings: number };
  progress: { needs: number; wants: number; savings: number };
  totalTarget: number;
  totalSpent: number;
};

// Internal logic: 50/30/20 (Needs/Wants/Savings). Never surface this ratio in UI.
const DEFAULT_RATIOS: Record<Bucket, number> = {
  needs: 0.5,
  wants: 0.3,
  savings: 0.2,
};

export function deriveTargets(monthIncome: number, override: SmartBudget): SmartBudget {
  return {
    needs: override.needs > 0 ? override.needs : Math.round(monthIncome * DEFAULT_RATIOS.needs),
    wants: override.wants > 0 ? override.wants : Math.round(monthIncome * DEFAULT_RATIOS.wants),
    savings: override.savings > 0 ? override.savings : Math.round(monthIncome * DEFAULT_RATIOS.savings),
  };
}

export function computeBudgetScore(t: SmartBudgetTotals): number {
  // 0-100. Reward staying within target on Needs/Wants, and meeting savings goal.
  const safeRatio = (spent: number, target: number) =>
    target <= 0 ? 1 : Math.max(0, 1 - Math.max(0, spent - target) / target);
  const needsScore = safeRatio(t.spent.needs, t.targets.needs); // 0..1
  const wantsScore = safeRatio(t.spent.wants, t.targets.wants);
  const savingsScore = t.targets.savings <= 0 ? 1 : Math.min(1, t.spent.savings / t.targets.savings);
  // Weighted: 30/30/40
  const score = needsScore * 0.3 + wantsScore * 0.3 + savingsScore * 0.4;
  return Math.round(score * 100);
}

export function smartInsight(t: SmartBudgetTotals, monthIncome: number): string {
  if (monthIncome <= 0 && t.totalSpent === 0) {
    return "Add your first transaction to unlock Smart Budget insights.";
  }
  const wantsOver = t.spent.wants > t.targets.wants && t.targets.wants > 0;
  const needsOver = t.spent.needs > t.targets.needs && t.targets.needs > 0;
  const savingsRatio = t.targets.savings > 0 ? t.spent.savings / t.targets.savings : 0;

  if (savingsRatio >= 0.9 && t.targets.savings > 0) {
    return "You are close to reaching your savings goal. Keep it up!";
  }
  if (wantsOver && !needsOver) {
    return "You are spending more than usual on Wants. Time to reign it in.";
  }
  if (needsOver) {
    return "Essentials are running high this month. Review recurring bills.";
  }
  if (savingsRatio < 0.4 && t.targets.savings > 0) {
    return "Savings are lagging behind. A small SIP today goes a long way.";
  }
  return "Great job! You are within budget.";
}
