import { httpKit } from "@/lib/http/http-kit";
import type { ApiEnvelope } from "@/types/api";

import type { ChangePasswordPayload, CurrentUser, LoginPayload } from "./types";

// Plain async functions. No React, no cache logic.
export const authApi = {
  // Tokens come back as Set-Cookie headers, nothing to read from the body.
  login: async (payload: LoginPayload): Promise<void> => {
    await httpKit.post("/auth/login", payload);
  },

  logout: async (): Promise<void> => {
    await httpKit.post("/auth/logout");
  },

  // http-kit calls this itself on 401. Exposed for completeness/tests.
  refresh: async (): Promise<void> => {
    await httpKit.post("/auth/refresh-token");
  },

  me: async (): Promise<CurrentUser> => {
    const { data } = await httpKit.get<ApiEnvelope<CurrentUser>>("/user/me");
    return data.data;
  },

  // Success returns data: null. The backend then rejects every older token,
  // so the caller must end the session (see useChangePassword).
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await httpKit.patch("/user/me/change-password", payload);
  },
};