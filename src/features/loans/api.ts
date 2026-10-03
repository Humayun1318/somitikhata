import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope, PaginatedResult } from "@/types/api";

import type {
  ApplyLoanPayload,
  Loan,
  LoanCashPayload,
  LoanDecisionPayload,
  LoanDetail,
  LoanEligibility,
  LoanInstallment,
  LoanListParams,
} from "./types";

const data = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;
const loanUrl = (loanNo: string) => `/loans/${encodeURIComponent(loanNo)}`;

// The backend runs `search` as a regular expression; search literal text.
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Only params loan.builder.config.ts (and ?memberNo=) understand.
function toQueryParams(params: LoanListParams) {
  const search = params.search.trim();
  const memberNo = params.memberNo.trim();
  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search: escapeRegex(search) }),
    ...(params.status && { status: params.status }),
    ...(memberNo && { memberNo }),
    ...(params.sort && { sort: params.sort }),
  };
}

export const loanApi = {
  list: async (params: LoanListParams) =>
    data(await httpKit.get<ApiEnvelope<PaginatedResult<Loan>>>("/loans", { params: toQueryParams(params) })),

  detail: async (loanNo: string) => data(await httpKit.get<ApiEnvelope<LoanDetail>>(loanUrl(loanNo))),

  eligibility: async (memberNo: string) =>
    data(await httpKit.get<ApiEnvelope<LoanEligibility>>(`/loans/eligibility/${encodeURIComponent(memberNo)}`)),

  apply: async (payload: ApplyLoanPayload) => data(await httpKit.post<ApiEnvelope<Loan>>("/loans/apply", payload)),

  approve: async (loanNo: string, payload: LoanDecisionPayload) =>
    data(await httpKit.patch<ApiEnvelope<Loan>>(`${loanUrl(loanNo)}/approve`, payload)),

  reject: async (loanNo: string, payload: LoanDecisionPayload) =>
    data(await httpKit.patch<ApiEnvelope<Loan>>(`${loanUrl(loanNo)}/reject`, payload)),

  disburse: async (loanNo: string, payload: LoanCashPayload) =>
    data(await httpKit.post<ApiEnvelope<Loan>>(`${loanUrl(loanNo)}/disburse`, payload)),

  repayNext: async (loanNo: string, payload: LoanCashPayload) =>
    data(await httpKit.post<ApiEnvelope<LoanInstallment>>(`${loanUrl(loanNo)}/repay-next-installment`, payload)),
};
