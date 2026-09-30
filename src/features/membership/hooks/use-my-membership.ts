"use client";

import { useQuery } from "@tanstack/react-query";

import { memberApi } from "@/features/members/api";
import type { Member } from "@/features/members/types";
import { ApiError } from "@/lib/api-errors";

export const membershipKeys = { me: ["membership", "me"] as const };

// GET /member/me: the society-member record linked to the logged-in account.
// Not the login account itself (that is useMe() / GET /user/me).
export function useMyMembership() {
  return useQuery<Member, ApiError>({
    queryKey: membershipKeys.me,
    queryFn: memberApi.me,
  });
}
