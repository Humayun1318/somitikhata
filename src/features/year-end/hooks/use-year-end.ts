"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { authKeys } from "@/features/auth/query-keys";
import { ApiError } from "@/lib/api-errors";

import { yearEndApi } from "../api";
import { yearEndKeys } from "../query-keys";
import type {
  AppropriationPreview,
  DepreciationPayload,
  DividendPayload,
  DividendPreview,
  ServiceChargePreview,
  YearEndKind,
  YearEndRun,
  YearEndStatus,
} from "../types";

export function useYearEndStatus(fiscalYear: string) {
  return useQuery<YearEndStatus, ApiError>({
    queryKey: yearEndKeys.status(fiscalYear),
    queryFn: () => yearEndApi.status(fiscalYear),
    enabled: !!fiscalYear,
    staleTime: 30 * 1000,
  });
}

export function useYearEndRun(fiscalYear: string, kind: YearEndKind, enabled: boolean) {
  return useQuery<YearEndRun, ApiError>({
    queryKey: yearEndKeys.run(fiscalYear, kind),
    queryFn: () => yearEndApi.run(fiscalYear, kind),
    enabled: enabled && !!fiscalYear,
  });
}

// Previews are worked out on the server from today's data, so they are never
// reused from the cache: each open of a preview dialog asks again.
const PREVIEW = { staleTime: 0, gcTime: 0 } as const;

export function useServiceChargePreview(fiscalYear: string, enabled: boolean) {
  return useQuery<ServiceChargePreview, ApiError>({
    queryKey: yearEndKeys.preview(fiscalYear, "service_charge"),
    queryFn: () => yearEndApi.previewServiceCharge({ fiscalYear }),
    enabled,
    ...PREVIEW,
  });
}

/** `amount` in taka; null until the committee's amount is entered. */
export function useDividendPreview(fiscalYear: string, amount: number | null) {
  return useQuery<DividendPreview, ApiError>({
    queryKey: yearEndKeys.preview(fiscalYear, "dividend", amount ?? undefined),
    queryFn: () => yearEndApi.previewDividend({ fiscalYear, distributableAmount: amount ?? 0 }),
    enabled: amount !== null,
    ...PREVIEW,
  });
}

export function useAppropriationPreview(fiscalYear: string, enabled: boolean) {
  return useQuery<AppropriationPreview, ApiError>({
    queryKey: yearEndKeys.preview(fiscalYear, "appropriation"),
    queryFn: () => yearEndApi.previewAppropriation({ fiscalYear }),
    enabled,
    ...PREVIEW,
  });
}

// A run posts rows for many members and heads (and the appropriation also
// closes the books), so every screen's data may have changed: refresh it all.
// Only the signed-in user stays as it is.
function refreshEverything(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me[0] });
}

type RunVariables = { kind: YearEndKind; fiscalYear: string; distributableAmount?: number };

const LOADING_MESSAGE: Record<YearEndKind, string> = {
  service_charge: "runServiceCharge",
  dividend: "runDividend",
  appropriation: "runAppropriation",
};

export function useRunYearEnd(kind: YearEndKind) {
  const queryClient = useQueryClient();

  return useMutation<YearEndRun, ApiError, RunVariables>({
    meta: { loadingMessage: LOADING_MESSAGE[kind] },
    mutationFn: ({ fiscalYear, distributableAmount }) => {
      if (kind === "service_charge") return yearEndApi.runServiceCharge({ fiscalYear });
      if (kind === "appropriation") return yearEndApi.runAppropriation({ fiscalYear });
      const payload: DividendPayload = { fiscalYear, distributableAmount: distributableAmount ?? 0 };
      return yearEndApi.runDividend(payload);
    },
    onSuccess: () => refreshEverything(queryClient),
  });
}

export function useCreateDepreciation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, ApiError, DepreciationPayload>({
    meta: { loadingMessage: "createDepreciation" },
    mutationFn: yearEndApi.createDepreciation,
    // Head balances, samiti entries, reports and the year-end status all show it.
    onSuccess: () => refreshEverything(queryClient),
  });
}
