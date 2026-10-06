// Shapes from the backend report module. Money is PAISA; dates are ISO strings.
// Labels come from the backend in Bangla, as on the samiti's paper forms.
import type { CashAccountKind, HeadRole } from "@/features/collections/types";
import type {
  DividendSettings,
  DividendSummary,
  IncomeExpenseTotals,
  YearEndMemberLine,
} from "@/features/year-end/types";

export type ReportKind = "receipts-payments" | "trial-balance" | "income-expenditure" | "balance-sheet" | "dividend";
export const REPORT_KINDS: ReportKind[] = [
  "receipts-payments",
  "income-expenditure",
  "balance-sheet",
  "trial-balance",
  "dividend",
];

export type ReportLine = { key: string; label: string; amount: number; headId?: string };

// GET /reports/receipts-payments (প্রাপ্তি ও প্রদান)
export type ReceiptsPaymentsReport = {
  from: string;
  to: string;
  accounts: { _id: string; name: string; accountKind: CashAccountKind }[];
  opening: number;
  receipts: ReportLine[];
  totalReceipts: number;
  payments: ReportLine[];
  totalPayments: number;
  closing: number;
  actualClosing: number;
  difference: number;
  grandTotal: number;
};

// GET /reports/trial-balance (রেওয়ামিল)
export type TrialBalanceReport = {
  from: string;
  to: string;
  rows: { serial: number; key: string; label: string; page: null; debit: number; credit: number }[];
  totalDebit: number;
  totalCredit: number;
  difference: number;
};

// GET /reports/income-expenditure (আয়-ব্যয় হিসাব)
export type IncomeExpenditureReport = {
  fiscalYear: string;
  from: string;
  to: string;
  income: ReportLine[];
  expense: ReportLine[];
  totals: IncomeExpenseTotals;
  grandTotal: number;
  appropriation: {
    lines: { role: HeadRole; label: string; percent: number | null; amount: number }[];
    total: number;
    netProfit: number;
  } | null;
};

// GET /reports/balance-sheet (উদ্বৃত্ত পত্র)
export type BalanceSheetLine = ReportLine & { previous?: number; movements?: { label: string; amount: number }[] };
export type BalanceSheetSection = { key: string; label: string; lines: BalanceSheetLine[] };
export type BalanceSheetReport = {
  asOf: string;
  fiscalYear: string;
  liabilities: BalanceSheetSection[];
  assets: BalanceSheetSection[];
  totalLiabilities: number;
  totalAssets: number;
  difference: number;
};

// GET /reports/dividend/:fiscalYear (the dividend run's member list)
export type DividendReport = {
  fiscalYear: string;
  transactionDate: string;
  settings: DividendSettings;
  summary: DividendSummary;
  lines: YearEndMemberLine[];
  runAt?: string;
};

/** YYYY-MM-DD days, sent as the backend's ?from=&to= / ?asOf= */
export type DateRange = { from: string; to: string };
