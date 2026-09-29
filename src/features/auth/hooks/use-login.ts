"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "@/i18n/navigation";
import { CurrentUser, LoginPayload } from "@/features/auth/types";
import { ApiError } from "@/lib/api-errors";
import { authApi } from "@/features/auth/api";
import { authKeys } from "@/features/auth/query-keys";
import { getPostLoginRoute } from "@/features/auth/role-routes";


export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<CurrentUser, ApiError, LoginPayload>({
    meta: { loadingMessage: "login" },
    mutationFn: async (payload) => {
      await authApi.login(payload);
      // Direct call, not fetchQuery: we want a guaranteed fresh network
      // call, never a cached user, so there's nothing to read from cache.
      const user = await authApi.me();
      queryClient.setQueryData(authKeys.me, user);
      return user;
    },
    onSuccess: (user) => {
      router.replace(getPostLoginRoute(user));
    },
  });
}