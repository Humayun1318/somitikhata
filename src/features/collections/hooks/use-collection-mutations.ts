"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { cashAccountApi, transactionApi } from "../api";
import { collectionKeys } from "../query-keys";
import type {
  CashAccount,
  CashAccountStatus,
  CreateCashAccountPayload,
  CreateOpeningPayload,
  CreateTransactionPayload,
  ReversePayload,
  Transaction,
} from "../types";

// Any money action can change balances, cash books and passbooks: refetch them all.
function useRefreshCollections() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: collectionKeys.all });
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
