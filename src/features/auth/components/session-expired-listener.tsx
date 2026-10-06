"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePathname, useRouter } from "@/i18n/navigation";
import { registerSessionExpiredHandler } from "@/lib/http/session-events";
import { endSession } from "@/features/auth/end-session";
import { getAreaFromPathname, LOGIN_ROUTE } from "@/features/auth/role-routes";


// Renders nothing. Connects http-kit (axios) to the router and query cache:
// when refresh fails inside a protected area, clear all cached data and go to login.
export function SessionExpiredListener() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    return registerSessionExpiredHandler(() => {
      // Public pages (home, login, register) also call /user/me to know if
      // someone is signed in. A guest failing that check is not an expired
      // session: no redirect, and clearing the cache would kill the check itself.
      if (!getAreaFromPathname(pathname)) return;
      endSession(queryClient);
      router.replace(LOGIN_ROUTE);
    });
  }, [queryClient, router, pathname]);

  return null;
}