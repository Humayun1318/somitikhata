"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { collectionKeys } from "@/features/collections/query-keys";
import { ApiError } from "@/lib/api-errors";
import type { PaginatedResult } from "@/types/api";

import { loanApi } from "../api";
import { loanKeys } from "../query-keys";
import type {
  ApplyLoanPayload,
  Loan,
  LoanCashPayload,
  LoanDecisionPayload,
  LoanDetail,
  LoanEligibility,
  LoanInstallment,
  LoanListParams,
} from "../types";

const STALE_TIME = 30 * 1000;

export function useLoans(params: LoanListParams) {
  return useQuery<PaginatedResult<Loan>, ApiError>({
    queryKey: loanKeys.list(params),
    queryFn: () => loanApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useLoanDetail(loanNo: string) {
  return useQuery<LoanDetail, ApiError>({
    queryKey: loanKeys.detail(loanNo),
    queryFn: () => loanApi.detail(loanNo),
    enabled: !!loanNo,
    staleTime: STALE_TIME,
  });
}

// "" = off. Only for an active member (the backend refuses others).
export function useLoanEligibility(memberNo: string) {
  return useQuery<LoanEligibility, ApiError>({
    queryKey: loanKeys.eligibility(memberNo),
    queryFn: () => loanApi.eligibility(memberNo),
    enabled: !!memberNo,
    staleTime: STALE_TIME,
  });
}

// Disbursing and repaying move cash and the member's loan balance, so the
// collections views refresh too.
function useRefreshLoans(movesMoney: boolean) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: loanKeys.all }),
      movesMoney ? queryClient.invalidateQueries({ queryKey: collectionKeys.all }) : undefined,
    ]);
}

export function useApplyLoan() {
  const refresh = useRefreshLoans(false);
  return useMutation<Loan, ApiError, ApplyLoanPayload>({
    meta: { loadingMessage: "applyLoan" },
    mutationFn: loanApi.apply,
    onSuccess: refresh,
  });
}

type DecisionVariables = { loanNo: string; decision: "approve" | "reject"; payload: LoanDecisionPayload };

export function useDecideLoan() {
  const refresh = useRefreshLoans(false);
  return useMutation<Loan, ApiError, DecisionVariables>({
    meta: { loadingMessage: "decideLoan" },
    mutationFn: ({ loanNo, decision, payload }) =>
      decision === "approve" ? loanApi.approve(loanNo, payload) : loanApi.reject(loanNo, payload),
    onSuccess: refresh,
  });
}

type CashVariables = { loanNo: string; payload: LoanCashPayload };

export function useDisburseLoan() {
  const refresh = useRefreshLoans(true);
  return useMutation<Loan, ApiError, CashVariables>({
    meta: { loadingMessage: "disburseLoan" },
    mutationFn: ({ loanNo, payload }) => loanApi.disburse(loanNo, payload),
    onSuccess: refresh,
  });
}

export function useRepayInstallment() {
  const refresh = useRefreshLoans(true);
  return useMutation<LoanInstallment, ApiError, CashVariables>({
    meta: { loadingMessage: "repayInstallment" },
    mutationFn: ({ loanNo, payload }) => loanApi.repayNext(loanNo, payload),
    onSuccess: refresh,
  });
}
