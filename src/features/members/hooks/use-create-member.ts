"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.lists() }),
  });
}
