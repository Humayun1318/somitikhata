import type { CashAccountStatus } from "@/features/collections/types";
import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { CreateLedgerHeadPayload, LedgerHead, UpdateLedgerHeadPayload } from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

// Writes only. Heads are read together with their balances through
// transactionApi.headBalances (useHeadBalances in collections).
export const ledgerHeadApi = {
  create: async (payload: CreateLedgerHeadPayload) =>
    data(await httpKit.post<ApiEnvelope<LedgerHead>>("/ledger-heads/create", payload)),

  update: async (id: string, payload: UpdateLedgerHeadPayload) =>
    data(await httpKit.patch<ApiEnvelope<LedgerHead>>(`/ledger-heads/update/${id}`, payload)),

  updateStatus: async (id: string, status: CashAccountStatus) =>
    data(await httpKit.patch<ApiEnvelope<LedgerHead>>(`/ledger-heads/update-status/${id}`, { status })),
};
