import type { HeadBalanceRange, TransactionListParams } from "./types";

// Everything under "collections" is refetched after any money action,
// so balances, cash books and passbooks never disagree.
export const collectionKeys = {
  all: ["collections"] as const,
  accounts: () => [...collectionKeys.all, "accounts"] as const,
  accountBalance: (id: string) => [...collectionKeys.all, "account-balance", id] as const,
  cashBook: (id: string, params: TransactionListParams) => [...collectionKeys.all, "cash-book", id, params] as const,
  ledgers: () => [...collectionKeys.all, "ledger"] as const,
  ledger: (memberNo: string, params: TransactionListParams) => [...collectionKeys.ledgers(), memberNo, params] as const,
  memberBalances: (memberNo: string) => [...collectionKeys.all, "member-balances", memberNo] as const,
  reversal: (transactionId: string) => [...collectionKeys.all, "reversal", transactionId] as const,
  society: (params: TransactionListParams) => [...collectionKeys.all, "society", params] as const,
  headBalances: (range: HeadBalanceRange = {}) => [...collectionKeys.all, "head-balances", range] as const,
  openingSummary: () => [...collectionKeys.all, "opening-summary"] as const,
  // GET /member/:memberNo lookups (passbook, record and loan forms)
  members: () => [...collectionKeys.all, "member"] as const,
  member: (memberNo: string) => [...collectionKeys.members(), memberNo] as const,
  types: () => ["transaction-types"] as const,
};
