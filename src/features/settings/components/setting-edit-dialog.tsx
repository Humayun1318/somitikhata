"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Info, TriangleAlert } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { getCollectionError } from "@/features/collections/collection-errors";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useUpdateSetting } from "../hooks/use-settings";
import { settingFormSchema, type SettingFormInput } from "../schemas";
import { formatSettingValue, toSettingInput, toStoredSettingValue } from "../setting-values";
import type { SettingFormat, SettingSummary } from "../types";

type SettingEditDialogProps = {
  open: boolean;
  onClose: () => void;
  setting: SettingSummary;
  format: SettingFormat;
  /** Lowest allowed percent (1 for the limits, 0 for the funds). */
  min: number;
};

const SUFFIX: Partial<Record<SettingFormat, string>> = { percent: "%", money: "৳" };

// PATCH /settings/:key (super admin). Saves a new version from the chosen
// day; the old value stays in the history for anything decided before it.
// The parent passes a new `key` each time it opens.
export function SettingEditDialog({ open, onClose, setting, format, min }: SettingEditDialogProps) {
  const t = useTranslations("Settings");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const updateSetting = useUpdateSetting();
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingFormInput>({
    resolver: zodResolver(settingFormSchema(t, format, min)),
    defaultValues: { value: toSettingInput(format, setting.value), effectiveFrom: toDhakaDateString() },
    mode: "onTouched",
  });

  const isBusy = isSubmitting || updateSetting.isPending;
  const label = t(`keys.${setting.key}.label`);
  const currentText = setting.value === null ? t(`keys.${setting.key}.unset`) : formatSettingValue(format, setting.value, locale);
  const isDate = format === "date";
  const isLock = setting.key === "backdate_lock_until";
  const suffix = SUFFIX[format];

  const save = async (values: SettingFormInput) => {
    setFormError(null);
    try {
      await updateSetting.mutateAsync({
        key: setting.key,
        value: toStoredSettingValue(format, values.value),
        effectiveFrom: values.effectiveFrom,
      });
      onClose();
      toast.success(t("saved", { name: label }));
    } catch (error) {
      setFormError(getCollectionError(error, tErrors, locale).formError);
    }
  };

  const onSubmit = (values: SettingFormInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("editTitle", { name: label })}
      description={t("editDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("saving") : t("save")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <p className="rounded-xl bg-app-surface-muted/60 p-3 text-sm text-app-text">
        {t("currentValue")}: <span className="font-semibold tabular-nums">{currentText}</span>
      </p>

      {isLock && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("lockWarning")}
        </p>
      )}

      <FormField id="setting-value" label={t("newValue")} error={errors.value?.message}>
        <div className="relative">
          <Input
            id="setting-value"
            {...register("value")}
            type={isDate ? "date" : "text"}
            inputMode={isDate ? undefined : "decimal"}
            autoComplete="off"
            readOnly={isBusy}
            error={!!errors.value}
            aria-invalid={!!errors.value}
            aria-describedby={errors.value ? "setting-value-error" : undefined}
            className={suffix ? "min-h-11 pr-10 text-right text-base font-semibold tabular-nums" : "min-h-11"}
            data-autofocus
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-app-text-muted">
              {suffix}
            </span>
          )}
        </div>
      </FormField>

      <FormField id="setting-effectiveFrom" label={t("effectiveFrom")} error={errors.effectiveFrom?.message}>
        <Input
          id="setting-effectiveFrom"
          {...register("effectiveFrom")}
          type="date"
          readOnly={isBusy}
          error={!!errors.effectiveFrom}
          aria-invalid={!!errors.effectiveFrom}
          aria-describedby={errors.effectiveFrom ? "setting-effectiveFrom-error" : undefined}
          className="min-h-11"
        />
      </FormField>

      <p className="flex items-start gap-2 text-xs text-app-text-muted">
        <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t("versionNote")}
      </p>
    </Dialog>
  );
}
