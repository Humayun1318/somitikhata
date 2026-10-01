import type { Address } from "@/types/address";

// Shapes from the backend nominee module (bottolisomobai-server, nominee.interface.ts).

// Same values as NomineeRelation. "other" needs relationNote (e.g. "ভাতিজা").
export const NOMINEE_RELATIONS = [
  "spouse",
  "son",
  "daughter",
  "father",
  "mother",
  "brother",
  "sister",
  "other",
] as const;
export type NomineeRelation = (typeof NOMINEE_RELATIONS)[number];

// Same values as NomineeIdType. A minor usually has only a birth certificate.
export const NOMINEE_ID_TYPES = ["nid", "birth_certificate", "passport"] as const;
export type NomineeIdType = (typeof NOMINEE_ID_TYPES)[number];

// Backend limits (nominee.constants.ts).
export const MAX_NOMINEES = 2;
export const MIN_NOMINEES = 1;
export const ADULT_AGE = 18;

// Needed only when the nominee is under 18.
export type NomineeGuardian = {
  name: string;
  /** Free text: relation with the nominee, e.g. "মা". */
  relation: string;
  phone?: string;
};

export type Nominee = {
  _id: string;
  /** The member's _id. */
  member: string;
  name: string;
  relation: NomineeRelation;
  relationNote?: string;
  phone?: string;
  dob?: string;
  idType?: NomineeIdType;
  idNumber?: string;
  address?: Address;
  guardian?: NomineeGuardian;
  createdAt?: string;
  updatedAt?: string;
};

// POST /nominee/create/:memberNo and the `nominee` part of POST /member/create
// (createNomineeZodSchema, strict). The member comes from the URL, never the body.
export type CreateNomineePayload = {
  name: string;
  relation: NomineeRelation;
  relationNote?: string;
  phone?: string;
  dob?: string;
  idType?: NomineeIdType;
  idNumber?: string;
  address?: Address;
  guardian?: NomineeGuardian;
};

// PATCH /nominee/update/:id: every field optional, at least one.
export type UpdateNomineePayload = Partial<CreateNomineePayload>;
