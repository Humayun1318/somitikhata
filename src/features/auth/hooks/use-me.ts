"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api";
import { authKeys } from "@/features/auth/query-keys";
import type { CurrentUser } from "@/features/auth/types";
import { ApiError } from "@/lib/api-errors";

// The one source of the logged-in user (GET /user/me, cached under authKeys.me).
// In any client component under a protected layout: const { data: user } = useMe();
// AuthGate has already loaded it there, so `user` is ready without a new request.
// On reload it restores the session: if the access cookie is stale, http-kit
// refreshes and retries before this resolves. It only errors when the refresh
// token is also invalid, or the backend is unreachable.
// `null` = signed out on purpose (logout / session expired, see endSession).
export function useMe() {
  return useQuery<CurrentUser | null, ApiError>({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    // Role and status rarely change; a stale user refetches on the next mount.
    staleTime: 5 * 60 * 1000,
  });
}
