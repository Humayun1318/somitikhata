import { z } from "zod";

import { addressSchema, toAddressFormValues, toAddressPayload } from "@/lib/address";
import { toDhakaDateString } from "@/lib/dhaka-date";

import {
  ADULT_AGE,
  NOMINEE_ID_TYPES,
  NOMINEE_RELATIONS,
  type CreateNomineePayload,
  type Nominee,
  type NomineeIdType,
  type UpdateNomineePayload,
} from "./types";

// Mirrors the backend nominee rules (nominee.validation.ts + nominee.service.ts).
// The backend is the real check; this gives instant feedback.
const PHONE_REGEX = /^01[3-9]\d{8}$/;
const ID_NUMBER_REGEX: Record<NomineeIdType, RegExp> = {
  nid: /^(\d{10}|\d{13}|\d{17})$/,
  birth_certificate: /^\d{17}$/,
  passport: /^[A-Z0-9]{6,12}$/i,
};

type Translate = (key: string) => string;

// Under 18 on today's Dhaka date. dob is "YYYY-MM-DD" ("" = unknown = adult).
export function isMinorDob(dob: string) {
  if (!dob) return false;
  const [year, monthDay] = [Number(dob.slice(0, 4)), dob.slice(4)];
  return `${year + ADULT_AGE}${monthDay}` > toDhakaDateString();
}

// t: "Nominees" messages. tAddress: "Address" messages.
export function nomineeSchema(t: Translate, tAddress: Translate) {
  const name = z.string().trim().min(2, t("validation.nameMin")).max(50, t("validation.nameMax"));
  const optionalPhone = z
    .string()
    .trim()
    .refine((value) => !value || PHONE_REGEX.test(value), t("validation.phoneInvalid"));
  const notInFuture = (value: string) => !value || value <= toDhakaDateString();

  return z
    .object({
      name: z.string().trim().min(1, t("validation.nameRequired")).pipe(name),
      relation: z
        .enum(["", ...NOMINEE_RELATIONS])
        .refine((value: string) => value.length > 0, t("validation.relationRequired")),
      relationNote: z.string().trim().max(30, t("validation.relationNoteMax")),
      phone: optionalPhone,
      dob: z.string().refine(notInFuture, t("validation.dateInFuture")),
      idType: z.enum(["", ...NOMINEE_ID_TYPES]),
      idNumber: z.string().trim().max(20, t("validation.idNumberInvalid")),
      address: addressSchema(tAddress),
      guardian: z.object({
        name: z.string().trim(),
        relation: z.string().trim(),
        phone: optionalPhone,
      }),
    })
    .superRefine((value, ctx) => {
      const issue = (path: (string | number)[], key: string) =>
        ctx.addIssue({ code: "custom", path, message: t(`validation.${key}`) });

      if (value.relation === "other" && !value.relationNote) issue(["relationNote"], "relationNoteRequired");
      if (value.idType && !value.idNumber) issue(["idNumber"], "idNumberRequired");
      if (!value.idType && value.idNumber) issue(["idType"], "idTypeRequired");
      if (value.idType && value.idNumber && !ID_NUMBER_REGEX[value.idType].test(value.idNumber)) {
        issue(["idNumber"], `idNumberInvalid_${value.idType}`);
      }

      if (!isMinorDob(value.dob)) return;
      const guardianName = value.guardian.name;
      if (!guardianName) issue(["guardian", "name"], "guardianNameRequired");
      else if (guardianName.length < 2 || guardianName.length > 50) issue(["guardian", "name"], "nameMin");
      if (!value.guardian.relation) issue(["guardian", "relation"], "guardianRelationRequired");
      else if (value.guardian.relation.length > 30) issue(["guardian", "relation"], "relationNoteMax");
    });
}

export type NomineeInput = z.infer<ReturnType<typeof nomineeSchema>>;

// The standalone add/edit nominee form keeps the nominee under `nominee`,
// the same path it has inside the Add member form, so one set of fields serves both.
export function nomineeFormSchema(t: Translate, tAddress: Translate) {
  return z.object({ nominee: nomineeSchema(t, tAddress) });
}

export type NomineeFormInput = z.infer<ReturnType<typeof nomineeFormSchema>>;

export function toNomineeFormValues(nominee?: Nominee): NomineeInput {
  return {
    name: nominee?.name ?? "",
    relation: nominee?.relation ?? "",
    relationNote: nominee?.relationNote ?? "",
    phone: nominee?.phone ?? "",
    dob: nominee?.dob ? toDhakaDateString(nominee.dob) : "",
    idType: nominee?.idType ?? "",
    idNumber: nominee?.idNumber ?? "",
    address: toAddressFormValues(nominee?.address),
    guardian: {
      name: nominee?.guardian?.name ?? "",
      relation: nominee?.guardian?.relation ?? "",
      phone: nominee?.guardian?.phone ?? "",
    },
  };
}

// Strict backend schema: empty optional fields are left out, not sent as "".
// The relation note and the guardian are sent only when they apply
// (the backend drops them otherwise).
export function toNomineePayload(values: NomineeInput): CreateNomineePayload {
  const optional = (value: string) => value.trim() || undefined;
  const isMinor = isMinorDob(values.dob);
  // Schema refine guarantees relation is chosen.
  const relation = values.relation as CreateNomineePayload["relation"];

  return {
    name: values.name.trim(),
    relation,
    relationNote: relation === "other" ? optional(values.relationNote) : undefined,
    phone: optional(values.phone),
    dob: values.dob || undefined,
    idType: values.idType || undefined,
    idNumber: values.idType ? optional(values.idNumber) : undefined,
    address: toAddressPayload(values.address),
    guardian: isMinor
      ? {
          name: values.guardian.name.trim(),
          relation: values.guardian.relation.trim(),
          phone: optional(values.guardian.phone),
        }
      : undefined,
  };
}

// Edit sends the whole nominee. The address is always sent ({} when emptied),
// because the backend replaces the saved address with what it gets.
export function toUpdateNomineePayload(values: NomineeInput): UpdateNomineePayload {
  const payload = toNomineePayload(values);
  return { ...payload, address: payload.address ?? {} };
}

// The update API cannot remove a saved optional value (an empty string fails
// and there is no "unset"). Find fields the admin emptied, to warn before saving.
const CLEARABLE_FIELDS = ["phone", "dob", "idNumber"] as const;

export function findClearedNomineeFields(nominee: Nominee, values: NomineeInput) {
  const cleared = CLEARABLE_FIELDS.filter((field) => !!nominee[field] && !values[field].trim());
  // Choosing "no ID" clears the number too.
  if (nominee.idType && !values.idType && !cleared.includes("idNumber")) cleared.push("idNumber");
  return cleared;
}
