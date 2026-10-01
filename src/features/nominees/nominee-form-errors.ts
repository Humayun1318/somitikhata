import { ApiError } from "@/lib/api-errors";

type Translate = (key: string) => string;

// Nominee fields a server error can point at. The backend reports only the
// last part of a path ("name", "district"), so nested address/guardian errors
// can't be placed on a field and are shown as the form message instead.
const NOMINEE_FIELDS = ["relation", "relationNote", "dob", "idType", "idNumber"] as const;

export type NomineeFieldError = {
  field: `nominee.${(typeof NOMINEE_FIELDS)[number]}`;
  message: string;
};
export type NomineeFormErrors = {
  fieldErrors: NomineeFieldError[];
  formError: string | null;
};

type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

// Turns a failed nominee request into what the form should show.
export function getNomineeFormErrors(error: unknown, t: Translate, genericKey: string): NomineeFormErrors {
  const none: NomineeFormErrors = { fieldErrors: [], formError: null };

  if (!(error instanceof ApiError)) return { ...none, formError: t(genericKey) };
  if (error.status === 0) return { ...none, formError: t("errors.network") };

  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  const fieldErrors = sources.flatMap(({ path, message }) => {
    const field = NOMINEE_FIELDS.find((name) => name === path);
    return field && message ? [{ field: `nominee.${field}` as const, message }] : [];
  });
  if (fieldErrors.length > 0) return { ...none, fieldErrors };

  const isUsefulMessage = error.status < 500 && !!error.message && error.message !== "Zod Error";
  return {
    ...none,
    formError: isUsefulMessage ? error.message : t(genericKey),
  };
}
