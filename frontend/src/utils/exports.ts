import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { Platform, Alert } from "react-native";
import { Transaction } from "../context/FinanceContext";
import { getCategory } from "./categories";
import { formatINR, formatDate } from "./format";

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeCSV(s: string): string {
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function shareOrAlert(uri: string, dialogTitle: string, mime?: string) {
  if (Platform.OS === "web") {
    Alert.alert("Not available on web", "Open RupeeNest on an iOS or Android device to export.");
    return;
  }
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    Alert.alert("Sharing unavailable", "Sharing isn't available on this device.");
    return;
  }
  await Sharing.shareAsync(uri, { dialogTitle, mimeType: mime, UTI: mime });
}

export async function exportTransactionsPDF(transactions: Transaction[], userName: string) {
  if (Platform.OS === "web") {
    Alert.alert("Not available on web", "Open RupeeNest on an iOS or Android device to export.");
    return;
  }
  const now = new Date();
  const rows = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => {
      const cat = getCategory(t.category);
      const sign = t.type === "income" ? "+" : "-";
      return `<tr>
        <td>${escapeHTML(formatDate(t.date))}</td>
        <td>${escapeHTML(t.merchant || cat.label)}</td>
        <td>${escapeHTML(cat.label)}</td>
        <td style="text-align:right;color:${t.type === "income" ? "#2563EB" : "#0E1A2B"}">${sign}${escapeHTML(formatINR(t.amount).replace("-", ""))}</td>
      </tr>`;
    })
    .join("");
  const totalIn = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalEx = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const html = `
    <html><head><meta charset="utf-8"/><style>
      body { font-family: -apple-system, Helvetica, Arial; padding: 32px; color: #0E1A2B; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      .sub { color: #5B6B82; font-size: 12px; margin-bottom: 24px; }
      .summary { display: flex; gap: 16px; margin-bottom: 24px; }
      .pill { background: #E6EEF8; padding: 12px 16px; border-radius: 12px; flex: 1; }
      .pill .l { font-size: 11px; color: #5B6B82; }
      .pill .v { font-size: 18px; font-weight: 500; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { text-align: left; background: #E6EEF8; padding: 10px; }
      td { padding: 10px; border-bottom: 1px solid #E6EEF8; }
    </style></head><body>
      <h1>RupeeNest Transaction Report</h1>
      <div class="sub">${escapeHTML(userName)} • Generated ${escapeHTML(formatDate(now.toISOString()))}</div>
      <div class="summary">
        <div class="pill"><div class="l">Income</div><div class="v">${escapeHTML(formatINR(totalIn))}</div></div>
        <div class="pill"><div class="l">Expenses</div><div class="v">${escapeHTML(formatINR(totalEx))}</div></div>
        <div class="pill"><div class="l">Net</div><div class="v">${escapeHTML(formatINR(totalIn - totalEx))}</div></div>
      </div>
      <table><thead><tr><th>Date</th><th>Merchant</th><th>Category</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4" style="text-align:center;color:#5B6B82;padding:24px">No transactions</td></tr>`}</tbody></table>
    </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  await shareOrAlert(uri, "Export RupeeNest as PDF", "application/pdf");
}

export async function exportTransactionsCSV(transactions: Transaction[]) {
  if (Platform.OS === "web") {
    Alert.alert("Not available on web", "Open RupeeNest on an iOS or Android device to export.");
    return;
  }
  const header = ["Date", "Type", "Category", "Bucket", "Merchant", "Notes", "Amount"]
    .map(escapeCSV)
    .join(",");
  const lines = transactions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((t) => {
      const cat = getCategory(t.category);
      return [
        formatDate(t.date),
        t.type,
        cat.label,
        t.bucket ?? cat.bucket ?? "",
        t.merchant ?? "",
        t.notes ?? "",
        String(t.amount),
      ].map(escapeCSV).join(",");
    });
  const csv = [header, ...lines].join("\n");
  const dir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory;
  const uri = `${dir}rupeenest-${Date.now()}.csv`;
  await (FileSystem as any).writeAsStringAsync(uri, csv);
  await shareOrAlert(uri, "Export RupeeNest as CSV", "text/csv");
}

export async function exportBackupJSON(payload: object) {
  if (Platform.OS === "web") {
    Alert.alert("Not available on web", "Open RupeeNest on an iOS or Android device to export.");
    return;
  }
  const dir = (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory;
  const uri = `${dir}rupeenest-backup-${Date.now()}.json`;
  await (FileSystem as any).writeAsStringAsync(uri, JSON.stringify(payload, null, 2));
  await shareOrAlert(uri, "Save RupeeNest backup", "application/json");
}
