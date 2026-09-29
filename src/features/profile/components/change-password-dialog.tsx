"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import { useLogout } from "@/features/auth/hooks/use-logout";

import { getChangePasswordErrors } from "../change-password-errors";
import { PasswordRulesChecklist } from "./password-rules-checklist";
import {
  createChangePasswordSchema,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  type ChangePasswordInput,
} from "../schemas";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
};

function Field({ id, label, error, children, footer }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-app-text">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
      {footer}
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
  const toast = useToast();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [formError, setFormError] = useState<string | null>(null);
  // isSubmitting only updates after a re-render, so a fast double-tap or repeated
  // Enter can start a second request. This ref blocks it synchronously.
  const isRequestInFlight = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(createChangePasswordSchema(t)),
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
  });

  const newPasswordValue = useWatch({ control, name: "newPassword" });

  // Only the old and new password go to the API. confirmPassword stays here.
  const onSubmit = async ({ currentPassword, newPassword }: ChangePasswordInput) => {
    if (isRequestInFlight.current) return;
    isRequestInFlight.current = true;
    setFormError(null);

    try {
      await changePassword.mutateAsync({ oldPassword: currentPassword, newPassword });
    } catch (error) {
      const result = getChangePasswordErrors(error, t);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
      isRequestInFlight.current = false;
      return;
    }

    // Toasts sit under an open dialog, so close it first.
    onClose();
    toast.success(t("success"));
    // The backend now rejects the old cookies. Log out cleanly instead of
    // waiting for the next request to fail with 401.
    logout.mutate();
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  const submitLabel = isSubmitting ? t("submitting") : t("submit");
  const passwordToggleLabels = { showLabel: t("showPassword"), hideLabel: t("hidePassword") };
  const errorId = (name: keyof ChangePasswordInput) => (errors[name] ? `${name}-error` : undefined);
  const newPasswordDescribedBy = [errorId("newPassword"), "newPassword-rules"]
    .filter(Boolean)
    .join(" ");

  const passwordRules = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    met: rule.test(newPasswordValue),
    label: t(`rules.${rule.key}`, { min: PASSWORD_MIN_LENGTH }),
  }));


  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isSubmitting}
    >
      <form
        onSubmit={submitForm}
        noValidate
        aria-busy={isSubmitting}
        className="space-y-4"
      >
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
            aria-describedby={errorId("currentPassword")}
            readOnly={isSubmitting}
            {...passwordToggleLabels}
            {...register("currentPassword")}
          />
        </Field>

        <Field
          id="newPassword"
          label={t("newPassword")}
          error={errors.newPassword?.message}
          footer={
            <PasswordRulesChecklist
              id="newPassword-rules"
              title={t("rules.title")}
              metLabel={t("rules.met")}
              notMetLabel={t("rules.notMet")}
              rules={passwordRules}
              highlightUnmet={!!errors.newPassword}
            />
          }
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
            aria-describedby={newPasswordDescribedBy}
            readOnly={isSubmitting}
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
            aria-describedby={errorId("confirmPassword")}
            readOnly={isSubmitting}
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
