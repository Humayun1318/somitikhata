import { ApiError } from "@/lib/api-errors";

import type { CreateMemberInput } from "./schemas";

type Translate = (key: string) => string;

export type MemberFormErrors = {
  fieldErrors: { field: keyof CreateMemberInput; message: string }[];
  formError: string | null;
  /** Set when the NID already has a membership (409): the admin must confirm. */
  duplicateMemberNos: string | null;
};

const FORM_FIELDS: (keyof CreateMemberInput)[] = [
  "nameBn",
  "nameEn",
  "guardianName",
  "guardianRelation",
  "phone",
  "nid",
  "dob",
  "joinDate",
  "admissionFormNo",
  "businessName",
  "marketOrRoad",
  "businessType",
];

// Backend 409 text: "This NID already has: LBKS-0001, LBKS-0007. To add another ..."
const DUPLICATE_NID = /already has:\s*(.+?)\.\s*To add/i;

type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

// Turns a failed member request into what the form should show.
// genericKey: the fallback message ("errors.generic" for add, "errors.editGeneric" for edit).
export function getMemberFormErrors(
  error: unknown,
  t: Translate,
  genericKey = "errors.generic",
): MemberFormErrors {
  const none: MemberFormErrors = { fieldErrors: [], formError: null, duplicateMemberNos: null };

  if (!(error instanceof ApiError)) return { ...none, formError: t(genericKey) };
  if (error.status === 0) return { ...none, formError: t("errors.network") };

  if (error.status === 409) {
    const memberNos = error.message.match(DUPLICATE_NID)?.[1] ?? "";
    return { ...none, duplicateMemberNos: memberNos || error.message };
  }

  // Zod errors: { errorSources: [{ path: "phone", message: "..." }] }. The backend
  // sends only the last part of a nested path ("district", "name"), so address and
  // nominee errors can't be matched to a field; they show as the form message.
  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  const fieldErrors = sources.flatMap(({ path, message }) => {
    const field = FORM_FIELDS.find((name) => name === path);
    return field && message ? [{ field, message }] : [];
  });
  if (fieldErrors.length > 0) return { ...none, fieldErrors };

  const isUsefulMessage = error.status < 500 && !!error.message && error.message !== "Zod Error";
  return { ...none, formError: isUsefulMessage ? error.message : t(genericKey) };
}
