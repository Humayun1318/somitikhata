import { dhakaDayEnd, dhakaDayStart } from "@/lib/dhaka-date";
import { httpKit } from "@/lib/http/http-kit";
import { takaToPaisa } from "@/lib/money";
import type { ApiEnvelope, PaginatedResult } from "@/types/api";

import type {
  BucketBalance,
  CashAccount,
  CashAccountBalance,
  CashAccountStatus,
  CreateCashAccountPayload,
  CreateOpeningPayload,
  CreateSocietyEntryPayload,
  CreateTransactionPayload,
  CreateTransferPayload,
  HeadBalance,
  HeadBalanceRange,
  OpeningSummary,
  ReversePayload,
  Transaction,
  TransactionListParams,
  TransactionType,
  TransferResult,
} from "./types";

// Only params transaction.builder.config.ts understands. Empty values are left out.
function toQueryParams(params: TransactionListParams) {
  const search = params.search.trim();

  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search }),
    ...(params.transactionType && { transactionType: params.transactionType }),
    ...(params.startTransactionDate && { startTransactionDate: dhakaDayStart(params.startTransactionDate) }),
    ...(params.endTransactionDate && { endTransactionDate: dhakaDayEnd(params.endTransactionDate) }),
    // Stored amounts are paisa, so the range is sent in paisa too.
    ...(params.minAmount && { minAmount: takaToPaisa(params.minAmount) }),
    ...(params.maxAmount && { maxAmount: takaToPaisa(params.maxAmount) }),
    ...(params.sort && { sort: params.sort }),
    // Samiti entries list only
    ...(params.head && { head: params.head }),
    ...(params.cashAccount && { cashAccount: params.cashAccount }),
  };
}

type Paginated = ApiEnvelope<PaginatedResult<Transaction>>;

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const cashAccountApi = {
  list: async () => data(await httpKit.get<ApiEnvelope<CashAccount[]>>("/cash-accounts")),

  create: async (payload: CreateCashAccountPayload) =>
    data(await httpKit.post<ApiEnvelope<CashAccount>>("/cash-accounts/create", payload)),

  updateStatus: async (id: string, status: CashAccountStatus) =>
    data(await httpKit.patch<ApiEnvelope<CashAccount>>(`/cash-accounts/update-status/${id}`, { status })),
};

export const transactionTypeApi = {
  // Without typeGroup the backend returns active types except reversals.
  list: async (typeGroup?: string) =>
    data(
      await httpKit.get<ApiEnvelope<TransactionType[]>>("/transaction-types", {
        params: typeGroup ? { typeGroup } : undefined,
      }),
    ),
};

export const transactionApi = {
  cashBook: async (cashAccountId: string, params: TransactionListParams) =>
    data(
      await httpKit.get<ApiEnvelope<PaginatedResult<Transaction>>>(`/transactions/cash-book/${cashAccountId}`, {
        params: toQueryParams(params),
      }),
    ),

  cashBalance: async (cashAccountId: string) =>
    data(await httpKit.get<ApiEnvelope<CashAccountBalance>>(`/transactions/cash-balances/${cashAccountId}`)),

  ledger: async (memberNo: string, params: TransactionListParams) =>
    data(
      await httpKit.get<ApiEnvelope<PaginatedResult<Transaction>>>(
        `/transactions/ledger/${encodeURIComponent(memberNo)}`,
        { params: toQueryParams(params) },
      ),
    ),

  // Samiti entries (income, expense, asset, liability, transfers, head openings).
  society: async (params: TransactionListParams) =>
    data(await httpKit.get<Paginated>("/transactions/society", { params: toQueryParams(params) })),

  // The entry that reversed this one, if any. The backend has no "reversed" flag,
  // but its list endpoints can filter by reversalOf: the member's ledger, the
  // account's cash book, or (a head opening, which has neither) the samiti list.
  findReversal: async (transaction: Transaction): Promise<Transaction | null> => {
    const params = { reversalOf: transaction._id, limit: 1 };
    const url = transaction.member
      ? `/transactions/ledger/${encodeURIComponent(transaction.member.memberNo)}`
      : transaction.cashAccount
        ? `/transactions/cash-book/${transaction.cashAccount._id}`
        : "/transactions/society";
    const result = data(await httpKit.get<Paginated>(url, { params }));
    return result.data[0] ?? null;
  },

  memberBalances: async (memberNo: string) =>
    data(await httpKit.get<ApiEnvelope<BucketBalance[]>>(`/transactions/balances/${encodeURIComponent(memberNo)}`)),

  create: async (payload: CreateTransactionPayload) =>
    data(await httpKit.post<ApiEnvelope<Transaction>>("/transactions/create", payload)),

  reverse: async (payload: ReversePayload) =>
    data(await httpKit.post<ApiEnvelope<Transaction>>("/transactions/reverse", payload)),

  createOpening: async (payload: CreateOpeningPayload) =>
    data(await httpKit.post<ApiEnvelope<Transaction>>("/transactions/opening", payload)),

  createSociety: async (payload: CreateSocietyEntryPayload) =>
    data(await httpKit.post<ApiEnvelope<Transaction>>("/transactions/society", payload)),

  createTransfer: async (payload: CreateTransferPayload) =>
    data(await httpKit.post<ApiEnvelope<TransferResult>>("/transactions/transfer", payload)),

  // Every ledger head with its balance; a range limits the rows (e.g. this fiscal year).
  headBalances: async (range: HeadBalanceRange = {}) =>
    data(
      await httpKit.get<ApiEnvelope<HeadBalance[]>>("/transactions/head-balances", {
        params: {
          ...(range.from && { from: range.from }),
          ...(range.asOf && { asOf: range.asOf }),
        },
      }),
    ),

  openingSummary: async () => data(await httpKit.get<ApiEnvelope<OpeningSummary>>("/transactions/opening-summary")),
};
