"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-errors";

import { adminApi } from "../api";
import { adminKeys } from "../query-keys";
import type { CreateAdminPayload, StaffUser } from "../types";

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation<StaffUser, ApiError, CreateAdminPayload>({
    meta: { loadingMessage: "createAdmin" },
    mutationFn: adminApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.lists() }),
  });
}
