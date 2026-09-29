"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";

import {
  createChangePasswordSchema,
  PASSWORD_MIN_LENGTH,
  type ChangePasswordInput,
} from "../schemas";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function Field({ id, label, error, hint, children }: FieldProps) {
  const message = error ?? hint;
  const messageClass = error ? "text-red-600" : "text-app-text-muted";

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-app-text">
        {label}
      </label>
      {children}
      {message && (
        <p id={`${id}-message`} className={`mt-1.5 text-xs ${messageClass}`}>
          {message}
        </p>
      )}
    </div>
  );
}

const EMPTY_VALUES: ChangePasswordInput = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ChangePasswordDialogProps = {
  open: boolean;
  onClose: () => void;
};

// The parent passes a new `key` each time it opens, so the form starts empty.
export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const t = useTranslations("ChangePassword");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    setFormError(null);
    // API call is wired after the backend contract is confirmed.
    void values;
  };

  const submitLabel = isSubmitting ? t("submitting") : t("submit");
  const passwordToggleLabels = { showLabel: t("showPassword"), hideLabel: t("hidePassword") };
  const describedBy = (name: keyof ChangePasswordInput) =>
    errors[name] || name === "newPassword" ? `${name}-message` : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        <Field id="currentPassword" label={t("currentPassword")} error={errors.currentPassword?.message}>
          <PasswordInput
            id="currentPassword"
            data-autofocus
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder={t("currentPasswordPlaceholder")}
            error={!!errors.currentPassword}
            aria-invalid={!!errors.currentPassword}
            aria-describedby={describedBy("currentPassword")}
            disabled={isSubmitting}
            {...passwordToggleLabels}
            {...register("currentPassword")}
          />
        </Field>

        <Field
          id="newPassword"
          label={t("newPassword")}
          error={errors.newPassword?.message}
          hint={t("newPasswordHint", { min: PASSWORD_MIN_LENGTH })}
        >
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            placeholder={t("newPasswordPlaceholder")}
            error={!!errors.newPassword}
            aria-invalid={!!errors.newPassword}
            aria-describedby={describedBy("newPassword")}
            disabled={isSubmitting}
            {...passwordToggleLabels}
            {...register("newPassword", { deps: ["confirmPassword"] })}
          />
        </Field>

        <Field id="confirmPassword" label={t("confirmPassword")} error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            placeholder={t("confirmPasswordPlaceholder")}
            error={!!errors.confirmPassword}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={describedBy("confirmPassword")}
            disabled={isSubmitting}
            {...passwordToggleLabels}
            {...register("confirmPassword")}
          />
        </Field>

        <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
