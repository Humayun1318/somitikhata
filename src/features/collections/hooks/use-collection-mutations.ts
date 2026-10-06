"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loanKeys } from "@/features/loans/query-keys";
import { memberKeys } from "@/features/members/query-keys";
import { invalidateSummaries } from "@/features/overview/invalidate-summaries";
import { ApiError } from "@/lib/api-errors";

import { cashAccountApi, transactionApi } from "../api";
import { collectionKeys } from "../query-keys";
import type {
  CashAccount,
  CashAccountStatus,
  CreateCashAccountPayload,
  CreateOpeningPayload,
  CreateSocietyEntryPayload,
  CreateTransactionPayload,
  CreateTransferPayload,
  ReversePayload,
  Transaction,
  TransferResult,
} from "../types";

// Any money action can change balances, cash books and passbooks: refetch them all.
// Also what is computed from money elsewhere: loan eligibility (savings) and the
// member record's share flag (hasShareDeposit). Only queries on screen refetch
// now; the rest are just marked stale, so this costs nothing extra.
function useRefreshCollections() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: collectionKeys.all }),
      queryClient.invalidateQueries({ queryKey: loanKeys.eligibilities() }),
      queryClient.invalidateQueries({ queryKey: memberKeys.all }),
      invalidateSummaries(queryClient),
    ]);
}

export function useCreateTransaction() {
  const refresh = useRefreshCollections();

  return useMutation<Transaction, ApiError, CreateTransactionPayload>({
    meta: { loadingMessage: "createTransaction" },
    mutationFn: transactionApi.create,
    onSuccess: refresh,
  });
}

export function useReverseTransaction() {
  const refresh = useRefreshCollections();

  return useMutation<Transaction, ApiError, ReversePayload>({
    meta: { loadingMessage: "reverseTransaction" },
    mutationFn: transactionApi.reverse,
    onSuccess: refresh,
  });
}

export function useCreateOpening() {
  const refresh = useRefreshCollections();

  return useMutation<Transaction, ApiError, CreateOpeningPayload>({
    meta: { loadingMessage: "createOpening" },
    mutationFn: transactionApi.createOpening,
    onSuccess: refresh,
  });
}

export function useCreateSocietyEntry() {
  const refresh = useRefreshCollections();

  return useMutation<Transaction, ApiError, CreateSocietyEntryPayload>({
    meta: { loadingMessage: "createSocietyEntry" },
    mutationFn: transactionApi.createSociety,
    onSuccess: refresh,
  });
}

export function useCreateTransfer() {
  const refresh = useRefreshCollections();

  return useMutation<TransferResult, ApiError, CreateTransferPayload>({
    meta: { loadingMessage: "createTransfer" },
    mutationFn: transactionApi.createTransfer,
    onSuccess: refresh,
  });
}

export function useCreateCashAccount() {
  const refresh = useRefreshCollections();

  return useMutation<CashAccount, ApiError, CreateCashAccountPayload>({
    meta: { loadingMessage: "createCashAccount" },
    mutationFn: cashAccountApi.create,
    onSuccess: refresh,
  });
}

type StatusVariables = { id: string; status: CashAccountStatus };

export function useUpdateCashAccountStatus() {
  const refresh = useRefreshCollections();

  return useMutation<CashAccount, ApiError, StatusVariables>({
    meta: { loadingMessage: "updateCashAccountStatus" },
    mutationFn: ({ id, status }) => cashAccountApi.updateStatus(id, status),
    onSuccess: refresh,
  });
}
