import { z } from "zod";

import { meetsPasswordRules } from "@/lib/password-rules";

type Translate = (key: string, values?: Record<string, string | number>) => string;

export function createChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z.string().min(1, t("validation.currentRequired")),
      newPassword: z
        .string()
        .min(1, t("validation.newRequired"))
        .refine(meetsPasswordRules, {
          message: t("validation.newWeak"),
        }),
      // Frontend only: checked here, never sent to the API.
      confirmPassword: z.string().min(1, t("validation.confirmRequired")),
    })
    .superRefine((data, ctx) => {
      if (data.newPassword && data.newPassword === data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: t("validation.newSameAsCurrent"),
        });
      }
      if (data.confirmPassword && data.confirmPassword !== data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: t("validation.mismatch"),
        });
      }
    });
}

export type ChangePasswordInput = z.infer<ReturnType<typeof createChangePasswordSchema>>;
