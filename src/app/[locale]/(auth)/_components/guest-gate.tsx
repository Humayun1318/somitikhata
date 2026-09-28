"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { AuthLoading } from "./auth-loading";
import { useMe } from "@/hooks/use-me";
import { getPostLoginRoute } from "@/features/auth/role-routes";

/**
 * Wraps the login page. Waits for the session check so a logged-in user is
 * sent to their dashboard and never sees the login form. Any error just
 * means "not logged in", so the form shows.
 */
export function GuestGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace(getPostLoginRoute(user));
  }, [user, router]);

  if (isLoading || user) return <AuthLoading />;

  return <>{children}</>;
}