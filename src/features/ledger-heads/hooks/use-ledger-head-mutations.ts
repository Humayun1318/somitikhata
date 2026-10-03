"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { collectionKeys } from "@/features/collections/query-keys";
import type { CashAccountStatus } from "@/features/collections/types";
import { ApiError } from "@/lib/api-errors";

import { ledgerHeadApi } from "../api";
import type { CreateLedgerHeadPayload, LedgerHead, UpdateLedgerHeadPayload } from "../types";

// A head change touches no money, only the head lists (balances page,
// opening summary, every head dropdown).
function useRefreshHeads() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "head-balances"] }),
      queryClient.invalidateQueries({ queryKey: collectionKeys.openingSummary() }),
    ]);
}

export function useCreateLedgerHead() {
  const refresh = useRefreshHeads();

  return useMutation<LedgerHead, ApiError, CreateLedgerHeadPayload>({
    meta: { loadingMessage: "createLedgerHead" },
    mutationFn: ledgerHeadApi.create,
    onSuccess: refresh,
  });
}

type UpdateVariables = { id: string; payload: UpdateLedgerHeadPayload };

export function useUpdateLedgerHead() {
  const refresh = useRefreshHeads();

  return useMutation<LedgerHead, ApiError, UpdateVariables>({
    meta: { loadingMessage: "updateLedgerHead" },
    mutationFn: ({ id, payload }) => ledgerHeadApi.update(id, payload),
    onSuccess: refresh,
  });
}

type StatusVariables = { id: string; status: CashAccountStatus };

export function useUpdateLedgerHeadStatus() {
  const refresh = useRefreshHeads();

  return useMutation<LedgerHead, ApiError, StatusVariables>({
    meta: { loadingMessage: "updateLedgerHeadStatus" },
    mutationFn: ({ id, status }) => ledgerHeadApi.updateStatus(id, status),
    onSuccess: refresh,
  });
}
