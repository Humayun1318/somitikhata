"use client";

import { authApi } from "@/features/auth/api";
import { authKeys } from "@/features/auth/query-keys";
import { CurrentUser } from "@/features/auth/types";
import { ApiError } from "@/lib/api-errors";
import { useQuery } from "@tanstack/react-query";



// The session state. On reload it restores the session: if the access cookie
// is stale, http-kit refreshes and retries before this resolves. It only
// errors when the refresh token is also invalid, or the backend is unreachable.
export function useMe() {
  return useQuery<CurrentUser, ApiError>({
    queryKey: authKeys.me,
    queryFn: authApi.me,
  });
}