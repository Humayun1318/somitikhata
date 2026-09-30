import { z } from "zod";

import { toDhakaDateString } from "@/lib/dhaka-date";
import { TAKA_INPUT_PATTERN } from "@/lib/money";

import type { CreateOpeningPayload, CreateTransactionPayload } from "./types";

// Mirrors transaction.validation.ts in the backend. The backend is the real
// check; this gives instant feedback. `t` is useTranslations("TransactionForm").
type Translate = (key: string) => string;

const MAX_TAKA = 9_000_000_000;

// Taka as typed ("1500", "1500.50"): up to 2 decimals, more than 0, not huge.
function amountField(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t("validation.amountRequired"))
    .regex(TAKA_INPUT_PATTERN, t("validation.amountFormat"))
    .refine((value) => Number(value) > 0, t("validation.amountPositive"))
    .refine((value) => Number(value) <= MAX_TAKA, t("validation.amountTooLarge"));
}

// Day-only, not after today in Dhaka.
function dateField(t: Translate) {
  return z
    .string()
    .min(1, t("validation.date"))
    .refine((value) => value <= toDhakaDateString(), t("validation.dateFuture"));
}

const optionalText = (max: number, message: string) => z.string().trim().max(max, message);

export function recordTransactionSchema(t: Translate) {
  return z.object({
    memberNo: z.string().trim().min(1, t("validation.memberNo")),
    typeCode: z.string().min(1, t("validation.type")),
    cashAccountId: z.string().min(1, t("validation.account")),
    amount: amountField(t),
    transactionDate: dateField(t),
    voucherNo: optionalText(30, t("validation.voucherTooLong")),
    description: optionalText(200, t("validation.descriptionTooLong")),
  });
}

export type RecordTransactionInput = z.infer<ReturnType<typeof recordTransactionSchema>>;

export const RECORD_FIELDS: (keyof RecordTransactionInput)[] = [
  "memberNo",
  "typeCode",
  "cashAccountId",
  "amount",
  "transactionDate",
  "voucherNo",
  "description",
];

// Optional text is left out when empty (the backend schema is strict).
export function toCreateTransactionPayload(values: RecordTransactionInput): CreateTransactionPayload {
  return {
    memberNo: values.memberNo.trim(),
    typeCode: values.typeCode,
    cashAccountId: values.cashAccountId,
    amount: Number(values.amount),
    transactionDate: values.transactionDate,
    ...(values.voucherNo.trim() && { voucherNo: values.voucherNo.trim() }),
    ...(values.description.trim() && { description: values.description.trim() }),
  };
}

// Opening entry: member OR account, depending on the chosen type.
// `tOpening` is useTranslations("OpeningForm"); `needsMember(code)` reads the type's memberRule.
export function openingSchema(t: Translate, tOpening: Translate, needsMember: (typeCode: string) => boolean) {
  return z
    .object({
      typeCode: z.string().min(1, tOpening("validation.type")),
      memberNo: z.string().trim(),
      cashAccountId: z.string(),
      amount: amountField(t),
      transactionDate: dateField(t),
      description: optionalText(200, t("validation.descriptionTooLong")),
    })
    .superRefine((values, context) => {
      if (!values.typeCode) return;
      if (needsMember(values.typeCode) && !values.memberNo) {
        context.addIssue({ code: "custom", path: ["memberNo"], message: tOpening("validation.memberNo") });
      }
      if (!needsMember(values.typeCode) && !values.cashAccountId) {
        context.addIssue({ code: "custom", path: ["cashAccountId"], message: tOpening("validation.account") });
      }
    });
}

export type OpeningInput = z.infer<ReturnType<typeof openingSchema>>;

export const OPENING_FIELDS: (keyof OpeningInput)[] = [
  "typeCode",
  "memberNo",
  "cashAccountId",
  "amount",
  "transactionDate",
  "description",
];

export function toOpeningPayload(values: OpeningInput, needsMember: boolean): CreateOpeningPayload {
  return {
    typeCode: values.typeCode,
    ...(needsMember ? { memberNo: values.memberNo.trim() } : { cashAccountId: values.cashAccountId }),
    amount: Number(values.amount),
    transactionDate: values.transactionDate,
    ...(values.description.trim() && { description: values.description.trim() }),
  };
}
