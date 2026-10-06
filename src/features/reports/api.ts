import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type {
  BalanceSheetReport,
  DateRange,
  DividendReport,
  IncomeExpenditureReport,
  ReceiptsPaymentsReport,
  TrialBalanceReport,
} from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

// The backend validates these query strings strictly (report.validation.ts):
// only send what it accepts, dates as YYYY-MM-DD.
export const reportApi = {
  receiptsPayments: async (range: DateRange, cashAccountId?: string) =>
    data(
      await httpKit.get<ApiEnvelope<ReceiptsPaymentsReport>>("/reports/receipts-payments", {
        params: { ...range, ...(cashAccountId && { cashAccountId }) },
      }),
    ),

  trialBalance: async (range: DateRange) =>
    data(await httpKit.get<ApiEnvelope<TrialBalanceReport>>("/reports/trial-balance", { params: range })),

  incomeExpenditure: async (fiscalYear: string) =>
    data(await httpKit.get<ApiEnvelope<IncomeExpenditureReport>>("/reports/income-expenditure", { params: { fiscalYear } })),

  balanceSheet: async (asOf: string) =>
    data(await httpKit.get<ApiEnvelope<BalanceSheetReport>>("/reports/balance-sheet", { params: { asOf } })),

  dividend: async (fiscalYear: string) =>
    data(await httpKit.get<ApiEnvelope<DividendReport>>(`/reports/dividend/${encodeURIComponent(fiscalYear)}`)),
};
