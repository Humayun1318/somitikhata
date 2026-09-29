import { z } from "zod";

import { toDhakaDateString } from "@/lib/dhaka-date";

import type { CreateMemberPayload, Member, UpdateMemberPayload } from "./types";

// Mirrors createMemberZodSchema in the backend (member.validation.ts,
// user.validation.ts). The backend is the real check; this gives instant feedback.
const PHONE_REGEX = /^01[3-9]\d{8}$/;
const NID_REGEX = /^(\d{10}|\d{13}|\d{17})$/;

type Translate = (key: string) => string;

export function createMemberSchema(t: Translate) {
  const name = z
    .string()
    .trim()
    .min(2, t("validation.nameMin"))
    .max(50, t("validation.nameMax"));
  // Optional text: empty is fine, anything typed must follow the rules.
  const optionalName = z.union([z.literal(""), name]);
  // Same rule as the backend: not after today in Dhaka.
  const notInFuture = (value: string) => !value || value <= toDhakaDateString();

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

// Form values for a new member (empty) or an existing one (edit mode).
export function toMemberFormValues(member?: Member): CreateMemberInput {
  return {
    nameBn: member?.nameBn ?? "",
    nameEn: member?.nameEn ?? "",
    guardianName: member?.guardianName ?? "",
    guardianRelation: member?.guardianRelation ?? "",
    phone: member?.phone ?? "",
    nid: member?.nid ?? "",
    dob: member?.dob ? toDhakaDateString(member.dob) : "",
    joinDate: toDhakaDateString(member?.joinDate),
    admissionFormNo: member?.admissionFormNo ?? "",
  };
}

// Edit sends only the fields the admin changed (the backend update is partial).
export function toUpdateMemberPayload(
  values: CreateMemberInput,
  changed: Partial<Record<keyof CreateMemberInput, boolean | undefined>>,
): UpdateMemberPayload {
  const full = toCreateMemberPayload(values);
  const entries = Object.entries(full).filter(
    ([key, value]) => changed[key as keyof CreateMemberInput] && value !== undefined,
  );
  return Object.fromEntries(entries);
}

const OPTIONAL_FIELDS = ["nameEn", "guardianName", "guardianRelation", "dob", "admissionFormNo"] as const;

// The update API cannot remove a saved optional value (an empty name fails
// "min 2", and there is no "unset"). Find fields the admin emptied.
export function findClearedFields(member: Member, values: CreateMemberInput) {
  return OPTIONAL_FIELDS.filter((field) => !!member[field] && !values[field].trim());
}
