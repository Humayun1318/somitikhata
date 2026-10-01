import { ApiError } from "@/lib/api-errors";

type Translate = (key: string) => string;

// One message for a failed status change or password reset. The backend's own
// text is used when it explains the problem (e.g. "Only super admin can manage
// this account", "You cannot do this on your own account").
export function getUserActionError(error: unknown, t: Translate, genericKey: string) {
  if (!(error instanceof ApiError)) return t(genericKey);
  if (error.status === 0) return t("errors.network");
  const isUsefulMessage = error.status < 500 && !!error.message && error.message !== "Zod Error";
  return isUsefulMessage ? error.message : t(genericKey);
}
