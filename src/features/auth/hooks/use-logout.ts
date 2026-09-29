"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "@/i18n/navigation";
import { authApi } from "@/features/auth/api";
import { LOGIN_ROUTE } from "@/features/auth/role-routes";
import { ApiError } from "@/lib/api-errors";


export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, ApiError>({
    meta: { loadingMessage: "logout" },
    mutationFn: authApi.logout,
    onSettled: () => {
      router.replace(LOGIN_ROUTE);
      // Clear everything, so the next user never sees old cached data.
      queryClient.clear();
    },
  });
}