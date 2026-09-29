"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { memberApi } from "../api";
import { memberKeys } from "../query-keys";
import type { Member, UpdateMemberPayload } from "../types";

type UpdateMemberVariables = { memberNo: string; payload: UpdateMemberPayload };

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, UpdateMemberVariables>({
    meta: { loadingMessage: "updateMember" },
    mutationFn: ({ memberNo, payload }) => memberApi.update(memberNo, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.lists() }),
  });
}
