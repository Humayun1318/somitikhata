"use client";

import { useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS } from "@/components/shared/pagination";
import { usePathname, useRouter } from "@/i18n/navigation";

import { LOAN_STATUSES, type LoanListParams, type LoanStatus } from "../types";

const DEFAULT_LIMIT = 10; // loanQueryConfig.defaultLimit

const DEFAULTS: LoanListParams = { page: 1, limit: DEFAULT_LIMIT, search: "", status: "", memberNo: "", sort: "" };

const toStatus = (value: string | null): LoanStatus | "" => LOAN_STATUSES.find((status) => status === value) ?? "";

function toPositiveInt(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

// Loans list view state lives in the URL, like the members list.
export function useLoanListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const limit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const params: LoanListParams = {
    page: toPositiveInt(searchParams.get("page"), DEFAULTS.page),
    limit: PAGE_SIZE_OPTIONS.includes(limit as never) ? limit : DEFAULT_LIMIT,
    search: searchParams.get("search") ?? "",
    status: toStatus(searchParams.get("status")),
    memberNo: searchParams.get("memberNo") ?? "",
    sort: searchParams.get("sort") ?? "",
  };

  // Any change except "page" itself goes back to page 1.
  const setParams = (changes: Partial<LoanListParams>) => {
    const next = { ...params, ...changes };
    if (!("page" in changes)) next.page = 1;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      const isDefault = value === DEFAULTS[key as keyof LoanListParams];
      if (!isDefault && value !== "") query.set(key, String(value));
    }
    const queryString = query.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const hasFilters = !!(params.search || params.status || params.memberNo);
  const clearFilters = () => setParams({ search: "", status: "", memberNo: "" });

  return { params, setParams, hasFilters, clearFilters };
}
