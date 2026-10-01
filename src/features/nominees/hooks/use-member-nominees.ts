"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { nomineeApi } from "../api";
import { nomineeKeys } from "../query-keys";
import type { Nominee } from "../types";

// GET /nominee/member/:memberNo (admin): one member's nominees, main one first.
export function useMemberNominees(memberNo: string, enabled = true) {
  return useQuery<Nominee[], ApiError>({
    queryKey: nomineeKeys.byMember(memberNo),
    queryFn: () => nomineeApi.listByMember(memberNo),
    enabled: enabled && !!memberNo,
  });
}
