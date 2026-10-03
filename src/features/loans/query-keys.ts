import type { LoanListParams } from "./types";

export const loanKeys = {
  all: ["loans"] as const,
  list: (params: LoanListParams) => [...loanKeys.all, "list", params] as const,
  detail: (loanNo: string) => [...loanKeys.all, "detail", loanNo] as const,
  eligibility: (memberNo: string) => [...loanKeys.all, "eligibility", memberNo] as const,
};
