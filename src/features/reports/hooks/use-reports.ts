"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { reportApi } from "../api";
import { reportKeys } from "../query-keys";
import type {
  BalanceSheetReport,
  DateRange,
  DividendReport,
  IncomeExpenditureReport,
  ReceiptsPaymentsReport,
  TrialBalanceReport,
} from "../types";

// Money changes whenever an admin records something, so reports are asked
// again after 30 seconds (like the cash book and passbook).
const REPORT_STALE_TIME = 30 * 1000;

export function useReceiptsPayments(range: DateRange, cashAccountId: string, enabled: boolean) {
  return useQuery<ReceiptsPaymentsReport, ApiError>({
    queryKey: reportKeys.receiptsPayments(range, cashAccountId),
    queryFn: () => reportApi.receiptsPayments(range, cashAccountId || undefined),
    enabled,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useTrialBalance(range: DateRange, enabled: boolean) {
  return useQuery<TrialBalanceReport, ApiError>({
    queryKey: reportKeys.trialBalance(range),
    queryFn: () => reportApi.trialBalance(range),
    enabled,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useIncomeExpenditure(fiscalYear: string, enabled: boolean) {
  return useQuery<IncomeExpenditureReport, ApiError>({
    queryKey: reportKeys.incomeExpenditure(fiscalYear),
    queryFn: () => reportApi.incomeExpenditure(fiscalYear),
    enabled,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useBalanceSheet(asOf: string, enabled: boolean) {
  return useQuery<BalanceSheetReport, ApiError>({
    queryKey: reportKeys.balanceSheet(asOf),
    queryFn: () => reportApi.balanceSheet(asOf),
    enabled,
    staleTime: REPORT_STALE_TIME,
  });
}

export function useDividendReport(fiscalYear: string, enabled: boolean) {
  return useQuery<DividendReport, ApiError>({
    queryKey: reportKeys.dividend(fiscalYear),
    queryFn: () => reportApi.dividend(fiscalYear),
    enabled,
    staleTime: REPORT_STALE_TIME,
  });
}
