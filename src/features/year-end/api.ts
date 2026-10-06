import type { Transaction } from "@/features/collections/types";
import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type {
  AppropriationPreview,
  DepreciationPayload,
  DividendPayload,
  DividendPreview,
  FiscalYearPayload,
  ServiceChargePreview,
  YearEndKind,
  YearEndRun,
  YearEndStatus,
} from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

// Previews write nothing; runs post the rows (super admin only, once per year each).
export const yearEndApi = {
  status: async (fiscalYear: string) =>
    data(await httpKit.get<ApiEnvelope<YearEndStatus>>(`/year-end/${encodeURIComponent(fiscalYear)}`)),

  run: async (fiscalYear: string, kind: YearEndKind) =>
    data(await httpKit.get<ApiEnvelope<YearEndRun>>(`/year-end/${encodeURIComponent(fiscalYear)}/${kind}`)),

  previewServiceCharge: async (payload: FiscalYearPayload) =>
    data(await httpKit.post<ApiEnvelope<ServiceChargePreview>>("/year-end/service-charge/preview", payload)),

  runServiceCharge: async (payload: FiscalYearPayload) =>
    data(await httpKit.post<ApiEnvelope<YearEndRun>>("/year-end/service-charge/run", payload)),

  previewDividend: async (payload: DividendPayload) =>
    data(await httpKit.post<ApiEnvelope<DividendPreview>>("/year-end/dividend/preview", payload)),

  runDividend: async (payload: DividendPayload) =>
    data(await httpKit.post<ApiEnvelope<YearEndRun>>("/year-end/dividend/run", payload)),

  previewAppropriation: async (payload: FiscalYearPayload) =>
    data(await httpKit.post<ApiEnvelope<AppropriationPreview>>("/year-end/appropriation/preview", payload)),

  runAppropriation: async (payload: FiscalYearPayload) =>
    data(await httpKit.post<ApiEnvelope<YearEndRun>>("/year-end/appropriation/run", payload)),

  // Year-end depreciation of one asset head (no cash moves).
  createDepreciation: async (payload: DepreciationPayload) =>
    data(await httpKit.post<ApiEnvelope<Transaction>>("/transactions/depreciation", payload)),
};
