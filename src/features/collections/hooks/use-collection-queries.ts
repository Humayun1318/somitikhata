"use client";

import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";

import { memberApi } from "@/features/members/api";
import type { Member } from "@/features/members/types";
import { ApiError } from "@/lib/api-errors";
import type { PaginatedResult } from "@/types/api";

import { cashAccountApi, transactionApi, transactionTypeApi } from "../api";
import { collectionKeys } from "../query-keys";
import type {
  BucketBalance,
  CashAccount,
  CashAccountBalance,
  HeadBalance,
  HeadBalanceRange,
  OpeningSummary,
  Transaction,
  TransactionListParams,
  TransactionType,
} from "../types";

// Money changes whenever any admin records something, so it is never cached for long.
const MONEY_STALE_TIME = 30 * 1000;

export function useCashAccounts() {
  return useQuery<CashAccount[], ApiError>({
    queryKey: collectionKeys.accounts(),
    queryFn: cashAccountApi.list,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useCashBalance(cashAccountId: string) {
  return useQuery<CashAccountBalance, ApiError>({
    queryKey: collectionKeys.accountBalance(cashAccountId),
    queryFn: () => transactionApi.cashBalance(cashAccountId),
    enabled: !!cashAccountId,
    staleTime: MONEY_STALE_TIME,
  });
}

// Every account's balance at once (one request each: there is no "all balances" endpoint).
export function useCashBalances(accounts: CashAccount[]) {
  return useQueries({
    queries: accounts.map((account) => ({
      queryKey: collectionKeys.accountBalance(account._id),
      queryFn: () => transactionApi.cashBalance(account._id),
      staleTime: MONEY_STALE_TIME,
    })),
  });
}

export function useCashBook(cashAccountId: string, params: TransactionListParams) {
  return useQuery<PaginatedResult<Transaction>, ApiError>({
    queryKey: collectionKeys.cashBook(cashAccountId, params),
    queryFn: () => transactionApi.cashBook(cashAccountId, params),
    enabled: !!cashAccountId,
    placeholderData: keepPreviousData,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useLedger(memberNo: string, params: TransactionListParams) {
  return useQuery<PaginatedResult<Transaction>, ApiError>({
    queryKey: collectionKeys.ledger(memberNo, params),
    queryFn: () => transactionApi.ledger(memberNo, params),
    enabled: !!memberNo,
    placeholderData: keepPreviousData,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useMemberBalances(memberNo: string) {
  return useQuery<BucketBalance[], ApiError>({
    queryKey: collectionKeys.memberBalances(memberNo),
    queryFn: () => transactionApi.memberBalances(memberNo),
    enabled: !!memberNo,
    staleTime: MONEY_STALE_TIME,
  });
}

// GET /member/:memberNo. "41", "0041" and "LBKS-0041" all find the same member.
export function useMemberLookup(memberNo: string) {
  return useQuery<Member, ApiError>({
    queryKey: collectionKeys.member(memberNo),
    queryFn: () => memberApi.getByMemberNo(memberNo),
    enabled: !!memberNo,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useReversalOf(transaction: Transaction | null) {
  return useQuery<Transaction | null, ApiError>({
    queryKey: collectionKeys.reversal(transaction?._id ?? ""),
    queryFn: () => transactionApi.findReversal(transaction!),
    enabled: !!transaction && !transaction.reversalOf,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useSocietyEntries(params: TransactionListParams) {
  return useQuery<PaginatedResult<Transaction>, ApiError>({
    queryKey: collectionKeys.society(params),
    queryFn: () => transactionApi.society(params),
    placeholderData: keepPreviousData,
    staleTime: MONEY_STALE_TIME,
  });
}

// Every ledger head with its balance (all-time, or for a period). Also the
// head list for forms: it carries kind, section and status.
export function useHeadBalances(range: HeadBalanceRange = {}) {
  return useQuery<HeadBalance[], ApiError>({
    queryKey: collectionKeys.headBalances(range),
    queryFn: () => transactionApi.headBalances(range),
    placeholderData: keepPreviousData,
    staleTime: MONEY_STALE_TIME,
  });
}

export function useOpeningSummary(enabled = true) {
  return useQuery<OpeningSummary, ApiError>({
    queryKey: collectionKeys.openingSummary(),
    queryFn: transactionApi.openingSummary,
    enabled,
    staleTime: MONEY_STALE_TIME,
  });
}

export type TransactionTypeCatalog = {
  /** Active, non-reversal types (what an admin can pick). */
  types: TransactionType[];
  /** Every known type incl. reversals (list filters). */
  all: TransactionType[];
  /** The same, by code, to read a row's cash/member effect. */
  byCode: Map<string, TransactionType>;
  isPending: boolean;
  isError: boolean;
};

// Rows only carry the type's code and names, so their effect (cash in/out,
// which member bucket, plus/minus) is read from this catalog.
export function useTransactionTypes(): TransactionTypeCatalog {
  const [regular, reversal] = useQueries({
    queries: [
      { queryKey: [...collectionKeys.types(), "regular"], queryFn: () => transactionTypeApi.list() },
      { queryKey: [...collectionKeys.types(), "reversal"], queryFn: () => transactionTypeApi.list("reversal") },
    ],
  });

  const types = regular.data ?? [];
  const all = [...types, ...(reversal.data ?? [])];

  return {
    types,
    all,
    byCode: new Map(all.map((type) => [type.code, type])),
    isPending: regular.isPending || reversal.isPending,
    isError: regular.isError || reversal.isError,
  };
}
