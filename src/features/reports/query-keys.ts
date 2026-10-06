import type { DateRange } from "./types";

// Reports are read-only views of the books; any money action makes them stale
// (they are under their own root, refreshed by the year-end runs and on mount).
export const reportKeys = {
  all: ["reports"] as const,
  receiptsPayments: (range: DateRange, cashAccountId: string) =>
    [...reportKeys.all, "receipts-payments", range, cashAccountId] as const,
  trialBalance: (range: DateRange) => [...reportKeys.all, "trial-balance", range] as const,
  incomeExpenditure: (fiscalYear: string) => [...reportKeys.all, "income-expenditure", fiscalYear] as const,
  balanceSheet: (asOf: string) => [...reportKeys.all, "balance-sheet", asOf] as const,
  dividend: (fiscalYear: string) => [...reportKeys.all, "dividend", fiscalYear] as const,
};
