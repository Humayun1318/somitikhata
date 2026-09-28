"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { usePathname, useRouter } from "@/i18n/navigation";
import { registerSessionExpiredHandler } from "@/lib/http/http-kit";
import { LOGIN_ROUTE } from "@/features/auth/role-routes";


// Renders nothing. Connects http-kit (axios) to the router and query cache:
// when refresh fails, clear all cached data and go to login.
export function SessionExpiredListener() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    return registerSessionExpiredHandler(() => {
      // A guest on the login page has no session to clear. Clearing the cache
      // here would also kill GuestGate's own in-flight check.
      if (pathname === LOGIN_ROUTE) return;
      queryClient.clear();
      router.replace(LOGIN_ROUTE);
    });
  }, [queryClient, router, pathname]);

  return null;
}