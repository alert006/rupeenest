export function formatINR(amount: number, opts?: { showSign?: boolean; compact?: boolean }): string {
  const showSign = opts?.showSign ?? false;
  const abs = Math.abs(amount);
  let body: string;
  if (opts?.compact && abs >= 1000) {
    if (abs >= 10000000) body = (abs / 10000000).toFixed(2).replace(/\.00$/, "") + "Cr";
    else if (abs >= 100000) body = (abs / 100000).toFixed(2).replace(/\.00$/, "") + "L";
    else body = (abs / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    // Indian numbering format
    const fixed = abs.toFixed(2).replace(/\.00$/, "");
    const [intPart, decPart] = fixed.split(".");
    const lastThree = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const formattedInt = rest
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
    body = decPart ? `${formattedInt}.${decPart}` : formattedInt;
  }
  const sign = amount < 0 ? "-" : showSign ? "+" : "";
  return `${sign}₹${body}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function startOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function isSameMonth(iso: string, ref = new Date()): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function monthName(date = new Date()): string {
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}
