"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { memberApi, type MemberUploadOptions } from "../api";
import { invalidateMemberViews } from "../invalidate-member-views";
import type { Member, UpdateMemberPayload } from "../types";

type UpdateMemberVariables = { memberNo: string; payload: UpdateMemberPayload } & MemberUploadOptions;

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, ApiError, UpdateMemberVariables>({
    meta: { loadingMessage: "updateMember" },
    mutationFn: ({ memberNo, payload, ...options }) => memberApi.update(memberNo, payload, options),
    onSuccess: () => invalidateMemberViews(queryClient),
  });
}
