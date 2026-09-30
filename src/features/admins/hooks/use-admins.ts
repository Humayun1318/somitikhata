"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { adminApi } from "../api";
import { adminKeys } from "../query-keys";
import type { AdminListParams, PaginatedResult, StaffUser } from "../types";

// One page of admins. Old rows stay on screen while the next page loads.
export function useAdmins(params: AdminListParams) {
  return useQuery<PaginatedResult<StaffUser>, ApiError>({
    queryKey: adminKeys.list(params),
    queryFn: () => adminApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
