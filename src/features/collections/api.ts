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
  CreateTransactionPayload,
  ReversePayload,
  Transaction,
  TransactionListParams,
  TransactionType,
} from "./types";

// The backend runs `search` as a regular expression; search literal text.
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only params transaction.builder.config.ts understands. Empty values are left out.
function toQueryParams(params: TransactionListParams) {
  const search = params.search.trim();

  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search: escapeRegex(search) }),
    ...(params.transactionType && { transactionType: params.transactionType }),
    ...(params.startTransactionDate && { startTransactionDate: dhakaDayStart(params.startTransactionDate) }),
    ...(params.endTransactionDate && { endTransactionDate: dhakaDayEnd(params.endTransactionDate) }),
    // Stored amounts are paisa, so the range is sent in paisa too.
    ...(params.minAmount && { minAmount: takaToPaisa(params.minAmount) }),
    ...(params.maxAmount && { maxAmount: takaToPaisa(params.maxAmount) }),
    ...(params.sort && { sort: params.sort }),
  };
}

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

  // The entry that reversed this one, if any. The backend has no "reversed" flag,
  // but its list endpoints can filter by reversalOf, in the same ledger/cash book.
  findReversal: async (transaction: Transaction): Promise<Transaction | null> => {
    const params = { reversalOf: transaction._id, limit: 1 };
    const url = transaction.member
      ? `/transactions/ledger/${encodeURIComponent(transaction.member.memberNo)}`
      : `/transactions/cash-book/${transaction.cashAccount?._id}`;
    const result = data(await httpKit.get<ApiEnvelope<PaginatedResult<Transaction>>>(url, { params }));
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
};

export const settingApi = {
  // GET /settings/:key -> { key, value }
  get: async (key: string) =>
    data(await httpKit.get<ApiEnvelope<{ key: string; value: string | number | null }>>(`/settings/${key}`)),
};
