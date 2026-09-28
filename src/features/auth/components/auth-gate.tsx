"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import { useToast } from "@/components/shared/toast/toast-provider";
import { useMe } from "@/features/auth/hooks/use-me";
import {
  getAreaFromPathname,
  getPostLoginRoute,
  getProfileRoute,
  getRoleArea,
  LOGIN_ROUTE,
} from "@/features/auth/role-routes";
import { usePathname, useRouter } from "@/i18n/navigation";

import { AccessDenied } from "./access-denied";
import { AuthLoading } from "./auth-loading";

/**
 * Guards a protected area (admin, member, ...). Put it in that area's layout.
 * - not signed in           -> login
 * - signed in, wrong role   -> permission toast + AccessDenied page (no redirect)
 * - must change password    -> profile page of their own area
 *
 * Client side on purpose: the auth cookies belong to the backend's origin, so
 * the Next server never receives them. Only browser requests to the backend can
 * prove the session is valid. The backend still enforces real permissions.
 *
 * No `area` prop: the area comes from the URL itself. A new protected area
 * needs its segment added to role-routes.ts (AppArea, ROLE_AREA, getAreaFromPathname).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { data: user, error, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const t = useTranslations("Errors");

  const area = getAreaFromPathname(pathname);
  const profileRoute = area ? getProfileRoute(area) : null;
  const onProfile =
    !!profileRoute &&
    (pathname === profileRoute || pathname.startsWith(`${profileRoute}/`));

  const forbidden = !!user && (!area || getRoleArea(user.role) !== area);

  // Where this user must go instead of seeing this page (null = stay).
  let redirectTo: string | null = null;
  if (!user) {
    if (isError) redirectTo = LOGIN_ROUTE;
  } else if (!forbidden && user.mustChangePassword && !onProfile) {
    redirectTo = profileRoute;
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // One toast per blocked path, even under React strict mode's double effects.
  const toastedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!forbidden) {
      toastedFor.current = null;
      return;
    }
    if (toastedFor.current !== pathname) {
      toastedFor.current = pathname;
      toast.error(t("forbidden"));
    }
  }, [forbidden, pathname, toast, t]);

  // Backend down or network error is not "logged out". Let the existing
  // error boundary handle it instead of sending the user to login.
  if (isError && error.status !== 401) throw error;

  if (user && forbidden) return <AccessDenied homeHref={getPostLoginRoute(user)} />;

  if (!user || redirectTo) return <AuthLoading />;

  return <>{children}</>;
}
