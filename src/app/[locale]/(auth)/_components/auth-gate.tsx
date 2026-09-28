"use client";

import { useEffect, type ReactNode } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { AuthLoading } from "./auth-loading";
import { useMe } from "@/hooks/use-me";
import { getAreaFromPathname, getPostLoginRoute, getProfileRoute, getRoleArea, LOGIN_ROUTE } from "@/features/auth/role-routes";

/**
 * Wraps the admin and member layouts. Client side on purpose: the auth
 * cookies belong to the backend's origin, so the Next server never receives
 * them. Only browser requests to the backend can prove the session is valid.
 *
 * No `area` prop: the area comes from the URL itself, so both layouts use
 * this exact same line and there's nothing to get out of sync.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { data: user, error, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  const area = getAreaFromPathname(pathname);
  const profileRoute = area ? getProfileRoute(area) : null;
  const onProfile =
    !!profileRoute &&
    (pathname === profileRoute || pathname.startsWith(`${profileRoute}/`));

  // Where this user must go instead of seeing this page (null = stay).
  let redirectTo: string | null = null;
  if (!user) {
    if (isError) redirectTo = LOGIN_ROUTE;
  } else if (!area || getRoleArea(user.role) !== area) {
    redirectTo = getPostLoginRoute(user); // e.g. member opened /admin
  } else if (user.mustChangePassword && !onProfile) {
    redirectTo = profileRoute; // must change password first
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Backend down or network error is not "logged out". Let the existing
  // error boundary handle it instead of sending the user to login.
  if (isError && error.status !== 401) throw error;

  if (!user || redirectTo) return <AuthLoading />;

  return <>{children}</>;
}