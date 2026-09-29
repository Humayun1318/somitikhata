import { ApiError } from "@/lib/api-errors";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export type LoginErrorKind = "invalid" | "locked" | "account" | "network" | "other";

export type LoginError = {
  kind: LoginErrorKind;
  message: string;
};

// Backend auth.service.ts / validateUserStatus.ts send no error codes, only
// these messages. They are the source of truth; keep these patterns in sync.
//   401 "Invalid login ID or password"
//   403 "Too many wrong attempts. Try again in 3 minute(s)."
//   403 "Your account is suspended. Please contact the admin."
const LOCKED = /try again in (\d+) minute/i;
const ACCOUNT_STATUS = /your account is (\w+)/i;

// Turns a failed POST /auth/login into one localized message for both the
// toast and the inline form error. Numbers (like minutes) come from the backend.
export function getLoginError(error: unknown, t: Translate): LoginError {
  if (!(error instanceof ApiError)) {
    return { kind: "other", message: t("errors.generic") };
  }

  // status 0 = no response (offline, DNS, CORS, server down)
  if (error.status === 0) {
    return { kind: "network", message: t("errors.network") };
  }

  if (error.status === 401) {
    return { kind: "invalid", message: t("errors.invalidCredentials") };
  }

  if (error.status === 403) {
    const lockedMinutes = error.message.match(LOCKED)?.[1];
    if (lockedMinutes) {
      return { kind: "locked", message: t("errors.locked", { minutes: Number(lockedMinutes) }) };
    }

    const accountStatus = error.message.match(ACCOUNT_STATUS)?.[1]?.toLowerCase();
    if (accountStatus === "inactive" || accountStatus === "suspended") {
      return { kind: "account", message: t(`errors.account.${accountStatus}`) };
    }
  }

  // Anything else: the backend's own message is more useful than a generic one.
  const message = error.status < 500 && error.message ? error.message : t("errors.generic");
  return { kind: "other", message };
}
