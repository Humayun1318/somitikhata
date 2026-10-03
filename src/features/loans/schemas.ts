import { z } from "zod";

import { toDhakaDateString } from "@/lib/dhaka-date";
import { TAKA_INPUT_PATTERN } from "@/lib/money";

import type { ApplyLoanPayload, LoanCashPayload } from "./types";

type Translate = (key: string) => string;

// Mirrors loan.validation.ts (principal up to ৳10 crore, rate 0–100%,
// 1–120 months). `t` is useTranslations("Loans").
export function applyLoanSchema(t: Translate) {
  return z.object({
    memberNo: z.string().trim().min(1, t("validation.memberNo")),
    principal: z
      .string()
      .trim()
      .min(1, t("validation.principal"))
      .regex(TAKA_INPUT_PATTERN, t("validation.amountFormat"))
      .refine((value) => Number(value) > 0 && Number(value) <= 100_000_000, t("validation.principalRange")),
    interestRatePercent: z
      .string()
      .trim()
      .min(1, t("validation.rate"))
      .refine((value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 100, t("validation.rateRange")),
    tenureMonths: z
      .string()
      .trim()
      .min(1, t("validation.tenure"))
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 120, t("validation.tenureRange")),
  });
}

export type ApplyLoanInput = z.infer<ReturnType<typeof applyLoanSchema>>;
export const APPLY_LOAN_FIELDS: (keyof ApplyLoanInput)[] = ["memberNo", "principal", "interestRatePercent", "tenureMonths"];

export const toApplyLoanPayload = (values: ApplyLoanInput): ApplyLoanPayload => ({
  memberNo: values.memberNo.trim(),
  principal: Number(values.principal),
  interestRatePercent: Number(values.interestRatePercent),
  tenureMonths: Number(values.tenureMonths),
});

// Disburse / collect: which account and which day (not in the future).
export function loanCashSchema(t: Translate) {
  return z.object({
    cashAccountId: z.string().min(1, t("validation.account")),
    transactionDate: z
      .string()
      .min(1, t("validation.date"))
      .refine((value) => value <= toDhakaDateString(), t("validation.dateFuture")),
  });
}

export type LoanCashInput = z.infer<ReturnType<typeof loanCashSchema>>;
export const toLoanCashPayload = (values: LoanCashInput): LoanCashPayload => ({ ...values });
