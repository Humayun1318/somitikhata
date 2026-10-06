"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateSummaries } from "@/features/overview/invalidate-summaries";
import { ApiError } from "@/lib/api-errors";

import { memberApi } from "../api";
import { memberKeys } from "../query-keys";
import type { CreateMemberPayload, Member } from "../types";

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, CreateMemberPayload>({
    meta: { loadingMessage: "createMember" },
    mutationFn: memberApi.create,
    // Refetch every member list; the page keeps its own search/filter/page.
    // Dashboards count members too.
    onSuccess: () =>
      Promise.all([queryClient.invalidateQueries({ queryKey: memberKeys.lists() }), invalidateSummaries(queryClient)]),
  });
}
