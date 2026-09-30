"use client";

import { useState, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { PasswordRulesChecklist } from "@/components/shared/password-rules-checklist";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PASSWORD_RULES } from "@/lib/password-rules";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getAdminFormErrors } from "../admin-form-errors";
import { useCreateAdmin } from "../hooks/use-create-admin";
import { createAdminSchema, EMPTY_ADMIN_FORM, toCreateAdminPayload, type CreateAdminInput } from "../schemas";

type CreateAdminDialogProps = { open: boolean; onClose: () => void };

// POST /user/create-admin (super admin only).
// The parent passes a new `key` each time it opens, so the form starts empty.
export function CreateAdminDialog({ open, onClose }: CreateAdminDialogProps) {
  const t = useTranslations("AdminForm");
  const tRules = useTranslations("PasswordRules");
  const toast = useToast();
  const createAdmin = useCreateAdmin();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema(t)),
    defaultValues: EMPTY_ADMIN_FORM,
    mode: "onTouched",
  });

  // Busy while RHF submits OR the request is still running.
  const isBusy = isSubmitting || createAdmin.isPending;
  const passwordValue = useWatch({ control, name: "password" });
  const passwordRules = PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    met: rule.test(passwordValue),
    label: tRules(rule.key),
  }));

  const save = async (values: CreateAdminInput) => {
    setFormError(null);
    try {
      const created = await createAdmin.mutateAsync(toCreateAdminPayload(values));
      onClose();
      toast.success(t("success", { name: created.name, staffNo: created.staffNo ?? "" }));
    } catch (error) {
      const result = getAdminFormErrors(error, t);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: CreateAdminInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof CreateAdminInput) => ({
    id: `admin-${name}`,
    readOnly: isBusy,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `admin-${name}-error` : undefined,
    className: "min-h-11",
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("submitting") : t("submit")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="admin-name" label={t("fields.name")} error={errors.name?.message}>
          <Input {...fieldProps("name")} {...register("name")} autoComplete="off" placeholder={t("placeholders.name")} data-autofocus />
        </FormField>

        <FormField id="admin-phone" label={t("fields.phone")} error={errors.phone?.message}>
          <Input
            {...fieldProps("phone")}
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("placeholders.phone")}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="admin-email" label={t("fields.email")} error={errors.email?.message}>
            <Input
              {...fieldProps("email")}
              {...register("email")}
              type="email"
              autoCapitalize="none"
              autoComplete="off"
              placeholder={t("placeholders.email")}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField
            id="admin-password"
            label={t("fields.password")}
            error={errors.password?.message}
            footer={
              <PasswordRulesChecklist
                id="admin-password-rules"
                title={t("rulesTitle")}
                metLabel={tRules("met")}
                notMetLabel={tRules("notMet")}
                rules={passwordRules}
                highlightUnmet={!!errors.password}
              />
            }
          >
            <PasswordInput {...fieldProps("password")} {...register("password", { deps: ["confirmPassword"] })} autoComplete="new-password" />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="admin-confirmPassword" label={t("fields.confirmPassword")} error={errors.confirmPassword?.message}>
            <PasswordInput {...fieldProps("confirmPassword")} {...register("confirmPassword")} autoComplete="new-password" />
          </FormField>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-app-surface-muted/70 p-3 text-xs text-app-text-muted">
        <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t("loginNote")}
      </p>
    </Dialog>
  );
}
