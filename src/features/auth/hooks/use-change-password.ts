"use client";

import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api";
import type { ChangePasswordPayload } from "@/features/auth/types";
import { ApiError } from "@/lib/api-errors";

// Changing the password sets passwordChangedAt on the backend, which makes
// both the access and the refresh cookie invalid. So after success the caller
// must log out (useLogout) and send the user to sign in with the new password.
export function useChangePassword() {
  return useMutation<void, ApiError, ChangePasswordPayload>({
    meta: { loadingMessage: "changePassword" },
    mutationFn: authApi.changePassword,
  });
}
