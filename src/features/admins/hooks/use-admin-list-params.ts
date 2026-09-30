"use client";

import { useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS } from "@/components/shared/pagination";
import { usePathname, useRouter } from "@/i18n/navigation";

import type { AdminListParams } from "../types";

const DEFAULT_LIMIT = 10; // backend defaultLimit for users

const DEFAULTS: AdminListParams = { page: 1, limit: DEFAULT_LIMIT, search: "", sort: "" };

function toPositiveInt(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

// Search/sort/page live in the URL, like the members list.
export function useAdminListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const limit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const params: AdminListParams = {
    page: toPositiveInt(searchParams.get("page"), DEFAULTS.page),
    limit: PAGE_SIZE_OPTIONS.includes(limit as never) ? limit : DEFAULT_LIMIT,
    search: searchParams.get("search") ?? "",
    sort: searchParams.get("sort") ?? "",
  };

  // Any change except "page" itself goes back to page 1.
  const setParams = (changes: Partial<AdminListParams>) => {
    const next = { ...params, ...changes };
    if (!("page" in changes)) next.page = 1;

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      const isDefault = value === DEFAULTS[key as keyof AdminListParams];
      if (!isDefault && value !== "") query.set(key, String(value));
    }
    const queryString = query.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return { params, setParams };
}
