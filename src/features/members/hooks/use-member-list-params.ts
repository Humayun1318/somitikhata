"use client";

import { useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS } from "@/components/shared/pagination";
import { usePathname, useRouter } from "@/i18n/navigation";

import { MEMBER_STATUSES, type MemberListParams, type MemberStatus } from "../types";

const DEFAULT_LIMIT = 10; // backend defaultLimit for members

const DEFAULTS: MemberListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  search: "",
  status: "",
  sort: "",
  startJoinDate: "",
  endJoinDate: "",
};

// Only real backend statuses; anything else means "all".
function toStatus(value: string | null): MemberStatus | "" {
  return MEMBER_STATUSES.find((status) => status === value) ?? "";
}

function toPositiveInt(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

/**
 * The list's search/filter/sort/page live in the URL (?search=..&page=2).
 * So refresh, the back button and shared links keep the same view, and the
 * view survives actions like "Add member".
 */
export function useMemberListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const limit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);

  const params: MemberListParams = {
    page: toPositiveInt(searchParams.get("page"), DEFAULTS.page),
    limit: PAGE_SIZE_OPTIONS.includes(limit as never) ? limit : DEFAULT_LIMIT,
    search: searchParams.get("search") ?? "",
    status: toStatus(searchParams.get("status")),
    sort: searchParams.get("sort") ?? "",
    startJoinDate: searchParams.get("startJoinDate") ?? "",
    endJoinDate: searchParams.get("endJoinDate") ?? "",
  };

  // Any change except "page" itself goes back to page 1.
  const setParams = (changes: Partial<MemberListParams>) => {
    const next = { ...params, ...changes };
    if (!("page" in changes)) next.page = 1;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      const isDefault = value === DEFAULTS[key as keyof MemberListParams];
      if (!isDefault && value !== "") query.set(key, String(value));
    }

    const queryString = query.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const hasFilters = !!(params.search || params.status || params.startJoinDate || params.endJoinDate);
  const clearFilters = () => setParams({ search: "", status: "", startJoinDate: "", endJoinDate: "" });

  return { params, setParams, hasFilters, clearFilters };
}
