import { z } from "zod";

import { meetsPasswordRules } from "@/lib/password-rules";

import type { CreateAdminPayload } from "./types";

// Mirrors createAdminZodSchema in the backend (user.validation.ts, user.constants.ts).
// The backend is the real check; this gives instant feedback.
const PHONE_REGEX = /^01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Translate = (key: string) => string;

export function createAdminSchema(t: Translate) {
  return z
    .object({
      name: z.string().trim().min(1, t("validation.nameRequired")).min(2, t("validation.nameMin")).max(50, t("validation.nameMax")),
      phone: z.string().trim().min(1, t("validation.phoneRequired")).regex(PHONE_REGEX, t("validation.phoneInvalid")),
      email: z.string().trim().min(1, t("validation.emailRequired")).regex(EMAIL_REGEX, t("validation.emailInvalid")),
      password: z.string().min(1, t("validation.passwordRequired")).refine(meetsPasswordRules, t("validation.passwordWeak")),
      // Frontend only: checked here, never sent to the API.
      confirmPassword: z.string().min(1, t("validation.confirmRequired")),
    })
    .superRefine((data, ctx) => {
      if (data.confirmPassword && data.confirmPassword !== data.password) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: t("validation.mismatch") });
      }
    });
}

export type CreateAdminInput = z.infer<ReturnType<typeof createAdminSchema>>;

export const ADMIN_FORM_FIELDS: (keyof CreateAdminInput)[] = ["name", "phone", "email", "password", "confirmPassword"];

export const EMPTY_ADMIN_FORM: CreateAdminInput = { name: "", phone: "", email: "", password: "", confirmPassword: "" };

export function toCreateAdminPayload(values: CreateAdminInput): CreateAdminPayload {
  return {
    name: values.name.trim(),
    phone: values.phone.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}
