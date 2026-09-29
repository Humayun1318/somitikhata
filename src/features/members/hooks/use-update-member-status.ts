"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { memberApi } from "../api";
import { memberKeys } from "../query-keys";
import type { Member, UpdateMemberStatusPayload } from "../types";

type UpdateStatusVariables = { memberNo: string; payload: UpdateMemberStatusPayload };

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, UpdateStatusVariables>({
    meta: { loadingMessage: "updateMemberStatus" },
    mutationFn: ({ memberNo, payload }) => memberApi.updateStatus(memberNo, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.lists() }),
  });
}
