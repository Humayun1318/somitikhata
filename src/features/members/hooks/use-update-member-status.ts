"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/features/users/query-keys";
import { ApiError } from "@/lib/api-errors";

import { memberApi } from "../api";
import { invalidateMemberViews } from "../invalidate-member-views";
import type { Member, UpdateMemberStatusPayload } from "../types";

type UpdateStatusVariables = { memberNo: string; payload: UpdateMemberStatusPayload };

export function useUpdateMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, UpdateStatusVariables>({
    meta: { loadingMessage: "updateMemberStatus" },
    mutationFn: ({ memberNo, payload }) => memberApi.updateStatus(memberNo, payload),
    // The member's login account follows the member status, so refresh it too.
    onSuccess: () =>
      Promise.all([invalidateMemberViews(queryClient), queryClient.invalidateQueries({ queryKey: userKeys.all })]),
  });
}
