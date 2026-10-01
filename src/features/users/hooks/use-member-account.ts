"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { userAccountApi } from "../api";
import { userKeys } from "../query-keys";
import type { AccountUser } from "../types";

// The login account linked to one member (Member _id, not memberNo).
export function useMemberAccount(memberId: string, enabled = true) {
  return useQuery<AccountUser | null, ApiError>({
    queryKey: userKeys.byMember(memberId),
    queryFn: () => userAccountApi.findByMember(memberId),
    enabled: enabled && !!memberId,
  });
}
