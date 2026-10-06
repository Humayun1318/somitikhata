import type { LoanListParams } from "./types";

export const loanKeys = {
  all: ["loans"] as const,
  list: (params: LoanListParams) => [...loanKeys.all, "list", params] as const,
  detail: (loanNo: string) => [...loanKeys.all, "detail", loanNo] as const,
  eligibilities: () => [...loanKeys.all, "eligibility"] as const,
  eligibility: (memberNo: string) => [...loanKeys.eligibilities(), memberNo] as const,
};
