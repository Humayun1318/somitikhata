// Shapes from the backend yearEnd module. Money is PAISA; dates are ISO strings.
import type { HeadRole } from "@/features/collections/types";
import type { MemberStatus } from "@/features/members/types";

// The three runs, in the order they must happen. Depreciation is a plain
// entry (POST /transactions/depreciation) between the first two.
export type YearEndKind = "service_charge" | "dividend" | "appropriation";
export const YEAR_END_ORDER: YearEndKind[] = ["service_charge", "dividend", "appropriation"];

export type DividendGroup = "small" | "large";

// One member's line in a service charge or dividend run (or preview)
export type YearEndMemberLine = {
  member: string;
  memberNo: string;
  nameBn: string;
  status: MemberStatus;
  /** Service charge: Amanot on the year's last day. Dividend: the base (Stayi + Amanot). */
  balance: number;
  currentBalance?: number;
  amount: number;
  /** Service charge: the part the balance could not cover. */
  due?: number;
  /** Service charge run record: how much of `due` later deposits paid. */
  recovered?: number;
  currentYearDeposit?: number;
  group?: DividendGroup;
  capped?: boolean;
};

export type AppropriationLine = {
  role: HeadRole;
  head: string | null;
  nameBn: string | null;
  percent: number | null; // null = undistributed profit (the rest)
  amount: number;
};

export type ServiceChargeSummary = { memberCount: number; chargedCount: number; totalCharged: number; totalDue: number };

export type DividendSummary = {
  distributableAmount: number;
  totalBase: number;
  baseRate: number;
  eligibleCount: number;
  excludedCount: number;
  smallCount: number;
  smallTotal: number;
  cappedCount: number;
  largeRate: number | null;
  totalPaid: number;
  unpaid: number;
};

export type IncomeExpenseTotals = {
  incomeHeads: number;
  loanInterest: number;
  serviceCharge: number;
  totalIncome: number;
  expenseHeads: number;
  depreciation: number;
  dividend: number;
  totalExpense: number;
  netProfit: number;
};

export type AppropriationSummary = IncomeExpenseTotals & { totalAppropriated: number };

export type ServiceChargeSettings = { serviceChargeAmount: number };
export type DividendSettings = { capThreshold: number; capAmount: number; maxAmount: number };
export type AppropriationSettings = { reserveFundPercent: number; coopDevFundPercent: number; welfareFundPercent: number };

// POST /year-end/service-charge/preview
export type ServiceChargePreview = {
  fiscalYear: string;
  transactionDate: string;
  settings: ServiceChargeSettings;
  summary: ServiceChargeSummary;
  lines: YearEndMemberLine[];
};

// POST /year-end/dividend/preview
export type DividendPreview = {
  fiscalYear: string;
  transactionDate: string;
  settings: DividendSettings;
  summary: DividendSummary;
  lines: YearEndMemberLine[];
};

// POST /year-end/appropriation/preview (`problems` must be empty to run)
export type AppropriationPreview = {
  fiscalYear: string;
  transactionDate: string;
  settings: AppropriationSettings;
  summary: AppropriationSummary;
  appropriations: AppropriationLine[];
  problems: string[];
};

// GET /year-end/:fiscalYear — one step
export type YearEndStep = {
  kind: YearEndKind;
  done: boolean;
  runAt: string | null;
  summary: ServiceChargeSummary | DividendSummary | AppropriationSummary | null;
  settings: ServiceChargeSettings | DividendSettings | AppropriationSettings | null;
  /** Service charge only, once run */
  dues?: { totalRecovered: number; openDue: number; membersWithOpenDue: number };
  /** Appropriation only, once run */
  appropriations?: AppropriationLine[];
  canRun: boolean;
  blockedReason: string | null;
};

export type YearEndStatus = {
  fiscalYear: string;
  start: string;
  end: string;
  hasEnded: boolean;
  isClosed: boolean;
  lockUntil: string | null;
  steps: YearEndStep[];
  depreciation: { total: number; lines: { headId: string; nameBn: string; amount: number }[] };
};

// GET /year-end/:fiscalYear/:kind — a finished run with all its lines
export type YearEndRun = {
  _id: string;
  fiscalYear: string;
  kind: YearEndKind;
  transactionDate: string;
  settings: ServiceChargeSettings | DividendSettings | AppropriationSettings;
  summary: ServiceChargeSummary | DividendSummary | AppropriationSummary;
  lines: YearEndMemberLine[];
  appropriations: AppropriationLine[];
  createdAt?: string;
};

// Request bodies (amounts in TAKA)
export type FiscalYearPayload = { fiscalYear: string };
export type DividendPayload = FiscalYearPayload & { distributableAmount: number };
export type DepreciationPayload = {
  headId: string;
  amount: number;
  transactionDate: string;
  voucherNo?: string;
  description?: string;
};
