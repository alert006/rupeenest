export type CategoryKey =
  // Needs
  | "rent"
  | "groceries"
  | "electricity"
  | "water"
  | "fuel"
  | "medical"
  | "education"
  | "internet"
  // Wants
  | "food"
  | "movies"
  | "shopping"
  | "coffee"
  | "travel"
  | "entertainment"
  // Savings
  | "emergency_fund"
  | "sip"
  | "gold"
  | "fixed_deposit"
  // Income
  | "salary"
  | "freelance"
  | "investment"
  | "gift"
  | "other";

export type Bucket = "needs" | "wants" | "savings";

export type CategoryDef = {
  key: CategoryKey;
  label: string;
  icon: string;
  type: "expense" | "income" | "both";
  bucket?: Bucket;
};

export const CATEGORIES: CategoryDef[] = [
  // Needs
  { key: "rent", label: "Rent", icon: "home-outline", type: "expense", bucket: "needs" },
  { key: "groceries", label: "Groceries", icon: "cart-outline", type: "expense", bucket: "needs" },
  { key: "electricity", label: "Electricity", icon: "lightning-bolt-outline", type: "expense", bucket: "needs" },
  { key: "water", label: "Water", icon: "water-outline", type: "expense", bucket: "needs" },
  { key: "fuel", label: "Fuel", icon: "fuel", type: "expense", bucket: "needs" },
  { key: "medical", label: "Medical", icon: "heart-pulse", type: "expense", bucket: "needs" },
  { key: "education", label: "Education", icon: "book-outline", type: "expense", bucket: "needs" },
  { key: "internet", label: "Internet", icon: "wifi", type: "expense", bucket: "needs" },
  // Wants
  { key: "food", label: "Food & Dining", icon: "silverware-fork-knife", type: "expense", bucket: "wants" },
  { key: "movies", label: "Movies", icon: "movie-open-outline", type: "expense", bucket: "wants" },
  { key: "shopping", label: "Shopping", icon: "shopping-outline", type: "expense", bucket: "wants" },
  { key: "coffee", label: "Coffee", icon: "coffee-outline", type: "expense", bucket: "wants" },
  { key: "travel", label: "Travel", icon: "airplane", type: "expense", bucket: "wants" },
  { key: "entertainment", label: "Entertainment", icon: "gamepad-variant-outline", type: "expense", bucket: "wants" },
  // Savings
  { key: "emergency_fund", label: "Emergency Fund", icon: "shield-check-outline", type: "expense", bucket: "savings" },
  { key: "sip", label: "SIP", icon: "chart-line-variant", type: "expense", bucket: "savings" },
  { key: "gold", label: "Gold", icon: "gold", type: "expense", bucket: "savings" },
  { key: "fixed_deposit", label: "Fixed Deposit", icon: "bank-outline", type: "expense", bucket: "savings" },
  // Income
  { key: "salary", label: "Salary", icon: "cash-multiple", type: "income" },
  { key: "freelance", label: "Freelance", icon: "laptop", type: "income" },
  { key: "investment", label: "Investment", icon: "trending-up", type: "income" },
  { key: "gift", label: "Gift", icon: "gift-outline", type: "both" },
  { key: "other", label: "Other", icon: "dots-horizontal", type: "both" },
];

export function getCategory(key: CategoryKey): CategoryDef {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoriesFor(type: "income" | "expense"): CategoryDef[] {
  return CATEGORIES.filter((c) => c.type === type || c.type === "both");
}

export function categoriesByBucket(bucket: Bucket): CategoryDef[] {
  return CATEGORIES.filter((c) => c.bucket === bucket);
}

export function bucketOfCategory(key: CategoryKey): Bucket | null {
  return getCategory(key).bucket ?? null;
}

export const BUCKET_META: Record<Bucket, { label: string; description: string; icon: string }> = {
  needs: { label: "Needs", description: "Essentials you can't skip", icon: "home-heart" },
  wants: { label: "Wants", description: "Lifestyle & fun", icon: "shopping-outline" },
  savings: { label: "Savings", description: "Future you", icon: "piggy-bank-outline" },
};
