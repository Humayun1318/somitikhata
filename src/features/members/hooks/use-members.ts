"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { memberApi } from "../api";
import { memberKeys } from "../query-keys";
import type { Member, MemberListParams, PaginatedResult } from "../types";

// One page of members for the given search/filter/sort/page.
// keepPreviousData: while the next page loads, the old rows stay on screen.
export function useMembers(params: MemberListParams) {
  return useQuery<PaginatedResult<Member>, ApiError>({
    queryKey: memberKeys.list(params),
    queryFn: () => memberApi.list(params),
    placeholderData: keepPreviousData,
    // Other admins can add members too, so treat a list as fresh for 30s only.
    staleTime: 30 * 1000,
  });
}
