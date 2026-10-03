import { z } from "zod";

import { TAKA_INPUT_PATTERN } from "@/lib/money";

import type { SettingFormat } from "./types";

type Translate = (key: string, values?: Record<string, number>) => string;

// Same ranges as validateValueForKey in the backend. The server is the real check.
function valueField(t: Translate, format: SettingFormat, min: number) {
  const required = z.string().trim().min(1, t("validation.required"));

  if (format === "percent") {
    return required
      .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), t("validation.percentFormat"))
      .refine((value) => Number(value) >= min && Number(value) <= 100, t("validation.percentRange", { min }));
  }
  if (format === "money") return required.regex(TAKA_INPUT_PATTERN, t("validation.moneyFormat"));
  return required; // date: the date input only gives a valid day or ""
}

export function settingFormSchema(t: Translate, format: SettingFormat, min = 0) {
  return z.object({
    value: valueField(t, format, min),
    effectiveFrom: z.string().min(1, t("validation.effectiveFrom")),
  });
}

export type SettingFormInput = z.infer<ReturnType<typeof settingFormSchema>>;
