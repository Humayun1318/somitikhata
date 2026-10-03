"use client";

import { useSearchParams } from "next/navigation";

import { PAGE_SIZE_OPTIONS } from "@/components/shared/pagination";
import { usePathname, useRouter } from "@/i18n/navigation";

import type { TransactionListParams } from "../types";

const DEFAULT_LIMIT = 10; // backend defaultLimit for transactions

const DEFAULTS: TransactionListParams = {
  page: 1,
  limit: DEFAULT_LIMIT,
  search: "",
  transactionType: "",
  startTransactionDate: "",
  endTransactionDate: "",
  minAmount: "",
  maxAmount: "",
  sort: "",
  head: "",
  cashAccount: "",
};

const FILTER_KEYS = [
  "search",
  "transactionType",
  "startTransactionDate",
  "endTransactionDate",
  "minAmount",
  "maxAmount",
  "head",
  "cashAccount",
] as const;

function toPositiveInt(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

/**
 * Cash book / passbook / samiti entries view state, kept in the URL like the members list.
 * `scopeKey` is the URL key of what the list belongs to: ?account=<id> or ?member=<no>
 * (none for the samiti entries list). Changing the scope starts a fresh view.
 */
export function useTransactionListParams(scopeKey?: "account" | "member") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const scope = scopeKey ? (searchParams.get(scopeKey) ?? "") : "";
  const limit = toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
  const text = (key: keyof TransactionListParams) => searchParams.get(key) ?? "";

  const params: TransactionListParams = {
    page: toPositiveInt(searchParams.get("page"), DEFAULTS.page),
    limit: PAGE_SIZE_OPTIONS.includes(limit as never) ? limit : DEFAULT_LIMIT,
    search: text("search"),
    transactionType: text("transactionType"),
    startTransactionDate: text("startTransactionDate"),
    endTransactionDate: text("endTransactionDate"),
    minAmount: text("minAmount"),
    maxAmount: text("maxAmount"),
    sort: text("sort"),
    head: text("head"),
    cashAccount: text("cashAccount"),
  };

  const writeUrl = (nextScope: string, next: TransactionListParams) => {
    const query = new URLSearchParams();
    if (scopeKey && nextScope) query.set(scopeKey, nextScope);
    for (const [key, value] of Object.entries(next)) {
      const isDefault = value === DEFAULTS[key as keyof TransactionListParams];
      if (!isDefault && value !== "") query.set(key, String(value));
    }
    const queryString = query.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  // Any change except "page" itself goes back to page 1.
  const setParams = (changes: Partial<TransactionListParams>) => {
    const next = { ...params, ...changes };
    if (!("page" in changes)) next.page = 1;
    writeUrl(scope, next);
  };

  const setScope = (nextScope: string) => writeUrl(nextScope, { ...DEFAULTS, limit: params.limit });

  const hasFilters = FILTER_KEYS.some((key) => params[key] !== "");
  const clearFilters = () => setParams(Object.fromEntries(FILTER_KEYS.map((key) => [key, ""])));

  return { scope, setScope, params, setParams, hasFilters, clearFilters };
}
