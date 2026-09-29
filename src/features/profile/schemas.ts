import { z } from "zod";

// Mirrors passwordValidationSchema in the backend (user.validation.ts).
// Keep both in sync: the backend is the real check, this is for instant feedback.
// The on-screen text lives in messages/<locale>/profile.json (ChangePassword.rules),
// so if this number changes, update "minLength" there too (8 in en, ৮ in bn).
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES = [
  { key: "minLength", test: (value: string) => value.length >= PASSWORD_MIN_LENGTH },
  { key: "uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { key: "lowercase", test: (value: string) => /[a-z]/.test(value) },
  { key: "number", test: (value: string) => /\d/.test(value) },
  { key: "special", test: (value: string) => /[@$!%*?&]/.test(value) },
] as const;

type Translate = (key: string, values?: Record<string, string | number>) => string;

export function createChangePasswordSchema(t: Translate) {
  return z
    .object({
      currentPassword: z.string().min(1, t("validation.currentRequired")),
      newPassword: z
        .string()
        .min(1, t("validation.newRequired"))
        .refine((value) => PASSWORD_RULES.every((rule) => rule.test(value)), {
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
