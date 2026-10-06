import { z } from "zod";

import { toDhakaDateString } from "@/lib/dhaka-date";
import { TAKA_INPUT_PATTERN } from "@/lib/money";

import type { DepreciationPayload } from "./types";

type Translate = (key: string) => string;

// Mirrors createDepreciationZodSchema (transaction.validation.ts).
// `t` is useTranslations("YearEnd.depreciation").
export function depreciationSchema(t: Translate) {
  return z.object({
    headId: z.string().min(1, t("validation.head")),
    amount: z
      .string()
      .trim()
      .min(1, t("validation.amount"))
      .regex(TAKA_INPUT_PATTERN, t("validation.amountFormat"))
      .refine((value) => Number(value) > 0, t("validation.amountFormat")),
    transactionDate: z
      .string()
      .min(1, t("validation.date"))
      .refine((value) => value <= toDhakaDateString(), t("validation.dateFuture")),
    voucherNo: z.string().trim().max(30, t("validation.voucherLong")),
    description: z.string().trim().max(200, t("validation.descriptionLong")),
  });
}

export type DepreciationInput = z.infer<ReturnType<typeof depreciationSchema>>;
export const DEPRECIATION_FIELDS: (keyof DepreciationInput)[] = ["headId", "amount", "transactionDate", "voucherNo", "description"];

export const toDepreciationPayload = (values: DepreciationInput): DepreciationPayload => ({
  headId: values.headId,
  amount: Number(values.amount),
  transactionDate: values.transactionDate,
  ...(values.voucherNo.trim() && { voucherNo: values.voucherNo.trim() }),
  ...(values.description.trim() && { description: values.description.trim() }),
});
