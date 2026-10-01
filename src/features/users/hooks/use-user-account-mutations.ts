"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { userAccountApi } from "../api";
import { userKeys } from "../query-keys";
import type { AccountStatus, AccountUser } from "../types";

// Both refetch every login-account query (admin list, member accounts).
export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation<AccountUser, ApiError, { id: string; status: AccountStatus }>({
    meta: { loadingMessage: "updateAccountStatus" },
    mutationFn: ({ id, status }) => userAccountApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    meta: { loadingMessage: "resetPassword" },
    mutationFn: userAccountApi.resetPassword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
