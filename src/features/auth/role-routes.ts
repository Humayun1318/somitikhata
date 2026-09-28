import type { CurrentUser, UserRole } from "./types";

export type AppArea = "admin" | "member";

export const LOGIN_ROUTE = "/login";

const ROLE_AREA: Record<string, AppArea> = {
  super_admin: "admin",
  admin: "admin",
  member: "member",
};

// Unknown role falls back to the least privileged area. The backend is the
// real security boundary, this is only for where to send the user.
export function getRoleArea(role: UserRole): AppArea {
  return ROLE_AREA[role] ?? "member";
}

// Reads the area straight from the URL ("/admin/dashboard" -> "admin"),
// so nothing has to hardcode which layout it is.
export function getAreaFromPathname(pathname: string): AppArea | null {
  const [, first] = pathname.split("/");
  return first === "admin" || first === "member" ? first : null;
}

export function getDashboardRoute(area: AppArea): string {
  return `/${area}/dashboard`;
}

export function getProfileRoute(area: AppArea): string {
  return `/${area}/profile`;
}

// Where a logged-in user belongs right now.
export function getPostLoginRoute(user: CurrentUser): string {
  const area = getRoleArea(user.role);
  return user.mustChangePassword
    ? getProfileRoute(area)
    : getDashboardRoute(area);
}