import type { Loan } from "@/features/loans/types";
import type { Transaction, TransactionListParams } from "@/features/collections/types";
import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope, PaginatedResult } from "@/types/api";

import type { AdminOverview, MyOverview } from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

type MyLedgerParams = Pick<TransactionListParams, "page" | "limit">;

export const overviewApi = {
  // Admin dashboard (?fiscalYear= is validated strictly by the backend).
  admin: async (fiscalYear: string) =>
    data(await httpKit.get<ApiEnvelope<AdminOverview>>("/dashboard/overview", { params: { fiscalYear } })),

  // The signed-in member's own numbers, passbook and loans.
  mine: async () => data(await httpKit.get<ApiEnvelope<MyOverview>>("/dashboard/my-overview")),

  myLedger: async (params: MyLedgerParams) =>
    data(await httpKit.get<ApiEnvelope<PaginatedResult<Transaction>>>("/transactions/my-ledger", { params })),

  // The member's loans (newest first). The schedule itself is admin-only.
  myLoans: async () =>
    data(await httpKit.get<ApiEnvelope<Omit<Loan, "member">[]>>("/loans/my-loans")),
};
