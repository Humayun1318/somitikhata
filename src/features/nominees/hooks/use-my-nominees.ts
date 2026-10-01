"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { nomineeApi } from "../api";
import { nomineeKeys } from "../query-keys";
import type { Nominee } from "../types";

// GET /nominee/my-nominees (member role): read only.
export function useMyNominees() {
  return useQuery<Nominee[], ApiError>({
    queryKey: nomineeKeys.mine(),
    queryFn: nomineeApi.mine,
  });
}
