import type { TransactionListParams } from "./types";

// Everything under "collections" is refetched after any money action,
// so balances, cash books and passbooks never disagree.
export const collectionKeys = {
  all: ["collections"] as const,
  accounts: () => [...collectionKeys.all, "accounts"] as const,
  accountBalance: (id: string) => [...collectionKeys.all, "account-balance", id] as const,
  cashBook: (id: string, params: TransactionListParams) => [...collectionKeys.all, "cash-book", id, params] as const,
  ledger: (memberNo: string, params: TransactionListParams) =>
    [...collectionKeys.all, "ledger", memberNo, params] as const,
  memberBalances: (memberNo: string) => [...collectionKeys.all, "member-balances", memberNo] as const,
  reversal: (transactionId: string) => [...collectionKeys.all, "reversal", transactionId] as const,
  member: (memberNo: string) => [...collectionKeys.all, "member", memberNo] as const,
  types: () => ["transaction-types"] as const,
  setting: (key: string) => ["settings", key] as const,
};
