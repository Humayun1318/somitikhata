import { ApiError } from "@/lib/api-errors";

import { ADMIN_FORM_FIELDS, type CreateAdminInput } from "./schemas";

type Translate = (key: string) => string;
type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

export type AdminFormErrors = {
  fieldErrors: { field: keyof CreateAdminInput; message: string }[];
  formError: string | null;
};

// Duplicate key from the global error handler: `someone@mail.com already exists!!`.
// In this payload only the email is unique, so it belongs to the email field.
const DUPLICATE = /already exists!*$/i;

export function getAdminFormErrors(error: unknown, t: Translate): AdminFormErrors {
  const none: AdminFormErrors = { fieldErrors: [], formError: null };

  if (!(error instanceof ApiError)) return { ...none, formError: t("errors.generic") };
  if (error.status === 0) return { ...none, formError: t("errors.network") };
  if (error.status === 403) return { ...none, formError: t("errors.forbidden") };
  if (DUPLICATE.test(error.message)) {
    return { ...none, fieldErrors: [{ field: "email", message: t("errors.emailTaken") }] };
  }

  // Zod errors: { errorSources: [{ path: "phone", message: "..." }] }
  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  const fieldErrors = sources.flatMap(({ path, message }) => {
    const field = ADMIN_FORM_FIELDS.find((name) => name === path);
    return field && message ? [{ field, message }] : [];
  });
  if (fieldErrors.length > 0) return { ...none, fieldErrors };

  const isUsefulMessage = error.status < 500 && !!error.message && error.message !== "Zod Error";
  return { ...none, formError: isUsefulMessage ? error.message : t("errors.generic") };
}
