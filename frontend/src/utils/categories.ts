export type CategoryKey =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "groceries"
  | "rent"
  | "education"
  | "travel"
  | "salary"
  | "freelance"
  | "investment"
  | "gift"
  | "other";

export type CategoryDef = {
  key: CategoryKey;
  label: string;
  icon: string; // MaterialCommunityIcons name
  type: "expense" | "income" | "both";
};

export const CATEGORIES: CategoryDef[] = [
  { key: "food", label: "Food & Dining", icon: "silverware-fork-knife", type: "expense" },
  { key: "groceries", label: "Groceries", icon: "cart-outline", type: "expense" },
  { key: "transport", label: "Transport", icon: "car-outline", type: "expense" },
  { key: "shopping", label: "Shopping", icon: "shopping-outline", type: "expense" },
  { key: "bills", label: "Bills & Utilities", icon: "lightning-bolt-outline", type: "expense" },
  { key: "entertainment", label: "Entertainment", icon: "movie-open-outline", type: "expense" },
  { key: "health", label: "Health", icon: "heart-pulse", type: "expense" },
  { key: "rent", label: "Rent", icon: "home-outline", type: "expense" },
  { key: "education", label: "Education", icon: "book-outline", type: "expense" },
  { key: "travel", label: "Travel", icon: "airplane", type: "expense" },
  { key: "salary", label: "Salary", icon: "cash-multiple", type: "income" },
  { key: "freelance", label: "Freelance", icon: "laptop", type: "income" },
  { key: "investment", label: "Investment", icon: "chart-line", type: "income" },
  { key: "gift", label: "Gift", icon: "gift-outline", type: "both" },
  { key: "other", label: "Other", icon: "dots-horizontal", type: "both" },
];

export function getCategory(key: CategoryKey): CategoryDef {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoriesFor(type: "income" | "expense"): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type || c.type === "both");
}
