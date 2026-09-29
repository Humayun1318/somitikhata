import { ApiError } from "@/lib/api-errors";

import type { ChangePasswordInput } from "./schemas";

type FormField = keyof ChangePasswordInput;
type Translate = (key: string) => string;

export type ChangePasswordErrors = {
  fieldErrors: { field: FormField; message: string }[];
  formError: string | null;
};

// Backend body keys -> form field names.
const FIELD_BY_API_PATH: Record<string, FormField> = {
  oldPassword: "currentPassword",
  newPassword: "newPassword",
};

// Backend (user.service.ts) throws AppError(400, "Old password is incorrect").
// It sends no error code, so this message is the only signal. Keep in sync.
const WRONG_CURRENT_PASSWORD = /old password is incorrect/i;

// Backend's generic message for a Zod failure. Not useful to show on its own.
const ZOD_ERROR_MESSAGE = "Zod Error";

type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

// Turns a failed change-password request into field errors or one form error.
export function getChangePasswordErrors(error: unknown, t: Translate): ChangePasswordErrors {
  const none: ChangePasswordErrors = { fieldErrors: [], formError: null };

  if (!(error instanceof ApiError)) {
    return { ...none, formError: t("errors.generic") };
  }

  // status 0 = no response at all (offline, DNS, CORS, server down)
  if (error.status === 0) {
    return { ...none, formError: t("errors.network") };
  }

  if (error.status === 400 && WRONG_CURRENT_PASSWORD.test(error.message)) {
    return {
      ...none,
      fieldErrors: [{ field: "currentPassword", message: t("errors.wrongCurrent") }],
    };
  }

  // Zod errors: { errorSources: [{ path: "newPassword", message: "..." }] }
  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  const fieldErrors = sources.flatMap(({ path, message }) => {
    const field = path ? FIELD_BY_API_PATH[path] : undefined;
    return field && message ? [{ field, message }] : [];
  });

  if (fieldErrors.length > 0) {
    return { ...none, fieldErrors };
  }

  const isUsefulMessage =
    error.status < 500 && !!error.message && error.message !== ZOD_ERROR_MESSAGE;

  return { ...none, formError: isUsefulMessage ? error.message : t("errors.generic") };
}
