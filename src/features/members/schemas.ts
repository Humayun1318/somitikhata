import { z } from "zod";

import { addressSchema, toAddressFormValues, toAddressPayload } from "@/lib/address";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { nomineeSchema, toNomineeFormValues, toNomineePayload } from "@/features/nominees/schemas";

import type { CreateMemberPayload, Member, UpdateMemberPayload } from "./types";

// Mirrors createMemberZodSchema in the backend (member.validation.ts,
// user.validation.ts). The backend is the real check; this gives instant feedback.
const PHONE_REGEX = /^01[3-9]\d{8}$/;
const NID_REGEX = /^(\d{10}|\d{13}|\d{17})$/;

type Translate = (key: string) => string;

type MemberSchemaOptions = {
  /** "MemberForm" messages. */
  t: Translate;
  /** "Address" messages. */
  tAddress: Translate;
  /** "Nominees" messages. */
  tNominee: Translate;
  /** Add member: the first nominee is part of the form. Edit: nominees have their own dialog. */
  withNominee: boolean;
};

export function createMemberSchema({ t, tAddress, tNominee, withNominee }: MemberSchemaOptions) {
  const name = z
    .string()
    .trim()
    .min(2, t("validation.nameMin"))
    .max(50, t("validation.nameMax"));
  // Optional text: empty is fine, anything typed must follow the rules.
  const optionalName = z.union([z.literal(""), name]);
  // Same rule as the backend: not after today in Dhaka.
  const notInFuture = (value: string) => !value || value <= toDhakaDateString();
  const businessText = (key: string, max: number) =>
    z
      .string()
      .trim()
      .min(1, t(`validation.${key}Required`))
      .max(max, t(`validation.${key}Max`));
  const nominee = nomineeSchema(tNominee, tAddress);

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
    businessName: businessText("businessName", 100),
    marketOrRoad: businessText("marketOrRoad", 100),
    businessType: businessText("businessType", 50),
    presentAddress: addressSchema(tAddress, true),
    permanentAddress: addressSchema(tAddress),
    nominee: withNominee ? nominee : nominee.optional(),
  });
}

export type CreateMemberInput = z.infer<ReturnType<typeof createMemberSchema>>;

const optional = (value: string) => (value.trim() ? value.trim() : undefined);

// Member fields without the nominee (shared by add and edit).
// The backend schema is strict and optional names need 2+ characters,
// so empty optional fields must be left out, not sent as "".
function toMemberFields(values: CreateMemberInput) {
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
    businessName: values.businessName.trim(),
    marketOrRoad: values.marketOrRoad.trim(),
    businessType: values.businessType.trim(),
    // Upazila + district are required by the schema, so this is never empty.
    presentAddress: toAddressPayload(values.presentAddress) ?? {},
    permanentAddress: toAddressPayload(values.permanentAddress),
  };
}

export function toCreateMemberPayload(values: CreateMemberInput): CreateMemberPayload {
  if (!values.nominee) throw new Error("The first nominee is required to add a member");
  return { ...toMemberFields(values), nominee: toNomineePayload(values.nominee) };
}

// Form values for a new member (empty) or an existing one (edit mode, no nominee).
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
    businessName: member?.businessName ?? "",
    marketOrRoad: member?.marketOrRoad ?? "",
    businessType: member?.businessType ?? "",
    presentAddress: toAddressFormValues(member?.presentAddress),
    permanentAddress: toAddressFormValues(member?.permanentAddress),
    nominee: member ? undefined : toNomineeFormValues(),
  };
}

type ChangedFields = Partial<Record<keyof CreateMemberInput, unknown>>;

// Edit sends only the fields the admin changed (the backend update is partial).
// A changed address is sent whole: the backend replaces the saved one, and an
// emptied permanent address is sent as {} so it really gets cleared.
export function toUpdateMemberPayload(values: CreateMemberInput, changed: ChangedFields): UpdateMemberPayload {
  const full: UpdateMemberPayload = {
    ...toMemberFields(values),
    permanentAddress: toAddressPayload(values.permanentAddress) ?? {},
  };
  const entries = Object.entries(full).filter(
    ([key, value]) => !!changed[key as keyof CreateMemberInput] && value !== undefined,
  );
  return Object.fromEntries(entries);
}

const OPTIONAL_FIELDS = ["nameEn", "guardianName", "guardianRelation", "dob", "admissionFormNo"] as const;

// The update API cannot remove a saved optional value (an empty name fails
// "min 2", and there is no "unset"). Find fields the admin emptied.
export function findClearedFields(member: Member, values: CreateMemberInput) {
  return OPTIONAL_FIELDS.filter((field) => !!member[field] && !values[field].trim());
}
