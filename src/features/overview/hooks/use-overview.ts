"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { Transaction } from "@/features/collections/types";
import type { Loan } from "@/features/loans/types";
import { ApiError } from "@/lib/api-errors";
import type { PaginatedResult } from "@/types/api";

import { overviewApi } from "../api";
import { overviewKeys } from "../query-keys";
import type { AdminOverview, MyOverview } from "../types";

const MONEY_STALE_TIME = 30 * 1000;

export function useAdminOverview(fiscalYear: string) {
  return useQuery<AdminOverview, ApiError>({
    queryKey: overviewKeys.admin(fiscalYear),
    queryFn: () => overviewApi.admin(fiscalYear),
    staleTime: MONEY_STALE_TIME,
  });
}

export function useMyOverview() {
  return useQuery<MyOverview, ApiError>({
    queryKey: overviewKeys.mine(),
    queryFn: overviewApi.mine,
    staleTime: MONEY_STALE_TIME,
  });
}

// Pages of the member's own passbook: only page/limit change, so the old page
// stays on screen while the next one loads.
export function useMyLedger(page: number, limit: number) {
  return useQuery<PaginatedResult<Transaction>, ApiError>({
    queryKey: overviewKeys.myLedger(page, limit),
    queryFn: () => overviewApi.myLedger({ page, limit }),
    placeholderData: keepPreviousData,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useMyLoans() {
  return useQuery<Omit<Loan, "member">[], ApiError>({
    queryKey: overviewKeys.myLoans(),
    queryFn: overviewApi.myLoans,
    staleTime: MONEY_STALE_TIME,
  });
}
