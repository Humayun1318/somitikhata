import { z } from "zod";

import { toDhakaDateString } from "@/lib/dhaka-date";
import { TAKA_INPUT_PATTERN } from "@/lib/money";

import type {
  CreateOpeningPayload,
  CreateSocietyEntryPayload,
  CreateTransactionPayload,
  CreateTransferPayload,
} from "./types";

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

// What an opening type is entered against: a member, a ledger head or a
// cash/bank account (read from the type: memberRule, headEffect).
export type OpeningTarget = "member" | "head" | "account";

export function openingTargetOf(type: { memberRule: string; headEffect?: string } | undefined): OpeningTarget {
  if (type?.memberRule === "required") return "member";
  return type?.headEffect ? "head" : "account";
}

// Opening entry: one target, depending on the chosen type.
// `tOpening` is useTranslations("OpeningForm"); `targetOf(code)` reads the type.
export function openingSchema(t: Translate, tOpening: Translate, targetOf: (typeCode: string) => OpeningTarget) {
  return z
    .object({
      typeCode: z.string().min(1, tOpening("validation.type")),
      memberNo: z.string().trim(),
      cashAccountId: z.string(),
      headId: z.string(),
      amount: amountField(t),
      transactionDate: dateField(t),
      description: optionalText(200, t("validation.descriptionTooLong")),
    })
    .superRefine((values, context) => {
      if (!values.typeCode) return;
      const target = targetOf(values.typeCode);
      if (target === "member" && !values.memberNo) {
        context.addIssue({ code: "custom", path: ["memberNo"], message: tOpening("validation.memberNo") });
      }
      if (target === "account" && !values.cashAccountId) {
        context.addIssue({ code: "custom", path: ["cashAccountId"], message: tOpening("validation.account") });
      }
      if (target === "head" && !values.headId) {
        context.addIssue({ code: "custom", path: ["headId"], message: tOpening("validation.head") });
      }
    });
}

export type OpeningInput = z.infer<ReturnType<typeof openingSchema>>;

export const OPENING_FIELDS: (keyof OpeningInput)[] = [
  "typeCode",
  "memberNo",
  "cashAccountId",
  "headId",
  "amount",
  "transactionDate",
  "description",
];

export function toOpeningPayload(values: OpeningInput, target: OpeningTarget): CreateOpeningPayload {
  return {
    typeCode: values.typeCode,
    ...(target === "member" && { memberNo: values.memberNo.trim() }),
    ...(target === "account" && { cashAccountId: values.cashAccountId }),
    ...(target === "head" && { headId: values.headId }),
    amount: Number(values.amount),
    transactionDate: values.transactionDate,
    ...(values.description.trim() && { description: values.description.trim() }),
  };
}

// Samiti entry (POST /transactions/society). `tSociety` is useTranslations("SocietyForm").
export function societyEntrySchema(t: Translate, tSociety: Translate) {
  return z.object({
    typeCode: z.string().min(1, tSociety("validation.type")),
    headId: z.string().min(1, tSociety("validation.head")),
    cashAccountId: z.string().min(1, t("validation.account")),
    amount: amountField(t),
    transactionDate: dateField(t),
    voucherNo: optionalText(30, t("validation.voucherTooLong")),
    description: optionalText(200, t("validation.descriptionTooLong")),
  });
}

export type SocietyEntryInput = z.infer<ReturnType<typeof societyEntrySchema>>;

export const SOCIETY_FIELDS: (keyof SocietyEntryInput)[] = [
  "typeCode",
  "headId",
  "cashAccountId",
  "amount",
  "transactionDate",
  "voucherNo",
  "description",
];

export function toSocietyEntryPayload(values: SocietyEntryInput): CreateSocietyEntryPayload {
  return {
    typeCode: values.typeCode,
    headId: values.headId,
    cashAccountId: values.cashAccountId,
    amount: Number(values.amount),
    transactionDate: values.transactionDate,
    ...(values.voucherNo.trim() && { voucherNo: values.voucherNo.trim() }),
    ...(values.description.trim() && { description: values.description.trim() }),
  };
}

// Transfer between two samiti accounts (POST /transactions/transfer).
export function transferSchema(t: Translate, tTransfer: Translate) {
  return z
    .object({
      fromAccountId: z.string().min(1, tTransfer("validation.from")),
      toAccountId: z.string().min(1, tTransfer("validation.to")),
      amount: amountField(t),
      transactionDate: dateField(t),
      voucherNo: optionalText(30, t("validation.voucherTooLong")),
      description: optionalText(200, t("validation.descriptionTooLong")),
    })
    .refine((values) => !values.toAccountId || values.fromAccountId !== values.toAccountId, {
      path: ["toAccountId"],
      message: tTransfer("validation.same"),
    });
}

export type TransferInput = z.infer<ReturnType<typeof transferSchema>>;

export const TRANSFER_FIELDS: (keyof TransferInput)[] = [
  "fromAccountId",
  "toAccountId",
  "amount",
  "transactionDate",
  "voucherNo",
  "description",
];

export function toTransferPayload(values: TransferInput): CreateTransferPayload {
  return {
    fromAccountId: values.fromAccountId,
    toAccountId: values.toAccountId,
    amount: Number(values.amount),
    transactionDate: values.transactionDate,
    ...(values.voucherNo.trim() && { voucherNo: values.voucherNo.trim() }),
    ...(values.description.trim() && { description: values.description.trim() }),
  };
}
