"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

import { useToast } from "@/components/shared/toast/toast-provider";
import { FormAlert } from "@/components/shared/form-alert";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRulesChecklist } from "@/components/shared/password-rules-checklist";
import { PASSWORD_RULES } from "@/lib/password-rules";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getChangePasswordErrors } from "../change-password-errors";
import {
  createChangePasswordSchema,
  type ChangePasswordInput,
} from "../schemas";

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
  const tRules = useTranslations("PasswordRules");
  const toast = useToast();
  const changePassword = useChangePassword();
  const logout = useLogout();
  const [formError, setFormError] = useState<string | null>(null);
  const runLocked = useSubmitLock();

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

  // Busy while RHF submits OR the request is still running. isSubmitting alone
  // flips back to false when a blocked double-submit finishes early.
  const isBusy = isSubmitting || changePassword.isPending;
  const newPasswordValue = useWatch({ control, name: "newPassword" });

  // Only the old and new password go to the API. confirmPassword stays here.
  const changePasswordNow = async ({ currentPassword, newPassword }: ChangePasswordInput) => {
    setFormError(null);

    try {
      await changePassword.mutateAsync({ oldPassword: currentPassword, newPassword });
    } catch (error) {
      const result = getChangePasswordErrors(error, t);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
      return;
    }

    onClose();
    toast.success(t("success"));
    // The backend now rejects the old cookies. Log out cleanly instead of
    // waiting for the next request to fail with 401.
    logout.mutate();
  };

  const onSubmit = (values: ChangePasswordInput) => runLocked(() => changePasswordNow(values));

  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  const submitLabel = isBusy ? t("submitting") : t("submit");
  const errorId = (name: keyof ChangePasswordInput) => (errors[name] ? `${name}-error` : undefined);
  const newPasswordDescribedBy = [errorId("newPassword"), "newPassword-rules"]
    .filter(Boolean)
    .join(" ");

  const passwordRules = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    met: rule.test(newPasswordValue),
    label: tRules(rule.key),
  }));


  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={submitLabel}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <FormField id="currentPassword" label={t("currentPassword")} error={errors.currentPassword?.message}>
        <PasswordInput
          id="currentPassword"
          data-autofocus
          autoComplete="current-password"
          enterKeyHint="next"
          placeholder={t("currentPasswordPlaceholder")}
          error={!!errors.currentPassword}
          aria-invalid={!!errors.currentPassword}
          aria-describedby={errorId("currentPassword")}
          readOnly={isBusy}
          {...register("currentPassword")}
        />
      </FormField>

      <FormField
        id="newPassword"
        label={t("newPassword")}
        error={errors.newPassword?.message}
        footer={
          <PasswordRulesChecklist
            id="newPassword-rules"
            title={t("rules.title")}
            metLabel={tRules("met")}
            notMetLabel={tRules("notMet")}
            rules={passwordRules}
            highlightUnmet={!!errors.newPassword}
          />
        }
      >
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          enterKeyHint="next"
          placeholder={t("newPasswordPlaceholder")}
          error={!!errors.newPassword}
          aria-invalid={!!errors.newPassword}
          aria-describedby={newPasswordDescribedBy}
          readOnly={isBusy}
          {...register("newPassword", { deps: ["confirmPassword"] })}
        />
      </FormField>

      <FormField id="confirmPassword" label={t("confirmPassword")} error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          enterKeyHint="done"
          placeholder={t("confirmPasswordPlaceholder")}
          error={!!errors.confirmPassword}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errorId("confirmPassword")}
          readOnly={isBusy}
          {...register("confirmPassword")}
        />
      </FormField>
    </Dialog>
  );
}
