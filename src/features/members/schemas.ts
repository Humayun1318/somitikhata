import { z } from "zod";

import type { CreateMemberPayload } from "./types";

// Mirrors createMemberZodSchema in the backend (member.validation.ts,
// user.validation.ts). The backend is the real check; this gives instant feedback.
const PHONE_REGEX = /^01[3-9]\d{8}$/;
const NID_REGEX = /^(\d{10}|\d{13}|\d{17})$/;

type Translate = (key: string) => string;

// "YYYY-MM-DD" for today in the user's own calendar (what a date input shows).
export function todayDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function createMemberSchema(t: Translate) {
  const name = z
    .string()
    .trim()
    .min(2, t("validation.nameMin"))
    .max(50, t("validation.nameMax"));
  // Optional text: empty is fine, anything typed must follow the rules.
  const optionalName = z.union([z.literal(""), name]);
  const notInFuture = (value: string) => !value || value <= todayDateString();

  return z.object({
    nameBn: z.string().trim().min(1, t("validation.nameRequired")).pipe(name),
    nameEn: optionalName,
    guardianName: optionalName,
    guardianRelation: z.enum(["", "father", "spouse"]),
    phone: z
      .string()
      .trim()
      .min(1, t("validation.phoneRequired"))
      .regex(PHONE_REGEX, t("validation.phoneInvalid")),
    nid: z
      .string()
      .trim()
      .min(1, t("validation.nidRequired"))
      .regex(NID_REGEX, t("validation.nidInvalid")),
    dob: z.string().refine(notInFuture, t("validation.dateInFuture")),
    joinDate: z
      .string()
      .min(1, t("validation.joinDateRequired"))
      .refine(notInFuture, t("validation.dateInFuture")),
    admissionFormNo: z.string().trim().max(30, t("validation.formNoMax")),
  });
}

export type CreateMemberInput = z.infer<ReturnType<typeof createMemberSchema>>;

// The backend schema is strict and optional names need 2+ characters,
// so empty optional fields must be left out, not sent as "".
export function toCreateMemberPayload(values: CreateMemberInput): CreateMemberPayload {
  const optional = <T extends string>(value: T) => (value.trim() ? value.trim() : undefined);

  return {
    nameBn: values.nameBn.trim(),
    nameEn: optional(values.nameEn),
    guardianName: optional(values.guardianName),
    guardianRelation: values.guardianRelation || undefined,
    phone: values.phone.trim(),
    nid: values.nid.trim(),
    dob: values.dob || undefined,
    joinDate: values.joinDate,
    admissionFormNo: optional(values.admissionFormNo),
  };
}
