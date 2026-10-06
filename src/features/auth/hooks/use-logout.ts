"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "@/i18n/navigation";
import { authApi } from "@/features/auth/api";
import { endSession } from "@/features/auth/end-session";
import { LOGIN_ROUTE } from "@/features/auth/role-routes";
import { ApiError } from "@/lib/api-errors";


export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, ApiError>({
    meta: { loadingMessage: "logout" },
    mutationFn: authApi.logout,
    // Even if the request failed, this browser forgets the user, so the
    // next person never sees old cached data.
    onSettled: () => {
      endSession(queryClient);
      router.replace(LOGIN_ROUTE);
    },
  });
}