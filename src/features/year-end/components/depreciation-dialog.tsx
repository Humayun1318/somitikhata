"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";

import { FormAlert } from "@/components/shared/form-alert";
import { formatPaisa } from "@/lib/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useHeadBalances } from "@/features/collections/hooks/use-collection-queries";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { fiscalYearRange } from "@/lib/fiscal-year";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useCreateDepreciation } from "../hooks/use-year-end";
import { DEPRECIATION_FIELDS, depreciationSchema, toDepreciationPayload, type DepreciationInput } from "../schemas";
import { getYearEndError } from "../year-end-errors";

type DepreciationDialogProps = {
  open: boolean;
  onClose: () => void;
  fiscalYear: string;
};

// POST /transactions/depreciation (super admin): an asset head (land, building,
// furniture …) loses value at the year's end. No cash moves; it becomes an
// expense line, so it must be in before the profit appropriation.
export function DepreciationDialog({ open, onClose, fiscalYear }: DepreciationDialogProps) {
  const t = useTranslations("YearEnd.depreciation");
  const tYearEnd = useTranslations("YearEnd");
  const tErrors = useTranslations("YearEndErrors");
  const tKind = useTranslations("YearEnd.kinds");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const create = useCreateDepreciation();
  const runLocked = useSubmitLock();
  const heads = useHeadBalances();
  const [formError, setFormError] = useState<string | null>(null);

  // The year's last day if it is over, otherwise today (never a future day).
  const today = toDhakaDateString();
  const yearEnd = fiscalYearRange(fiscalYear).to;
  const defaultDate = yearEnd < today ? yearEnd : today;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DepreciationInput>({
    resolver: zodResolver(depreciationSchema(t)),
    defaultValues: { headId: "", amount: "", transactionDate: defaultDate, voucherNo: "", description: "" },
    mode: "onTouched",
  });

  const isBusy = isSubmitting || create.isPending;
  const headOptions = (heads.data ?? [])
    .filter((head) => head.kind === "asset" && head.status === "active" && head.balance > 0)
    .map((head) => ({ value: head._id, label: `${head.nameBn} · ${formatPaisa(head.balance, locale)}` }));

  const save = async (values: DepreciationInput) => {
    setFormError(null);
    try {
      await create.mutateAsync(toDepreciationPayload(values));
      onClose();
      toast.success(t("saved"));
    } catch (error) {
      const result = getYearEndError(error, { t: tErrors, tKind, tCollections, locale, fields: DEPRECIATION_FIELDS });
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof DepreciationInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: DepreciationInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title", { fiscalYear })}
      description={t("description")}
      closeLabel={tYearEnd("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={tYearEnd("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? tYearEnd("saving") : t("save")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <FormField id="depreciation-head" label={t("head")} error={errors.headId?.message}>
        <Controller
          control={control}
          name="headId"
          render={({ field }) => (
            <SelectMenu
              id="depreciation-head"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={headOptions}
              placeholder={heads.isPending ? tYearEnd("loading") : t("headPlaceholder")}
              disabled={isBusy}
              error={!!errors.headId}
              aria-describedby={errors.headId ? "depreciation-head-error" : undefined}
            />
          )}
        />
      </FormField>
      {heads.data && headOptions.length === 0 && <p className="text-xs text-amber-700">{t("noHeads")}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="depreciation-amount" label={t("amount")} error={errors.amount?.message}>
          <Input
            id="depreciation-amount"
            {...register("amount")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            error={!!errors.amount}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "depreciation-amount-error" : undefined}
            className="min-h-11"
          />
        </FormField>
        <FormField id="depreciation-date" label={t("date")} error={errors.transactionDate?.message}>
          <Input
            id="depreciation-date"
            {...register("transactionDate")}
            type="date"
            max={today}
            readOnly={isBusy}
            error={!!errors.transactionDate}
            aria-invalid={!!errors.transactionDate}
            aria-describedby={errors.transactionDate ? "depreciation-date-error" : undefined}
            className="min-h-11"
          />
        </FormField>
      </div>

      <FormField id="depreciation-voucher" label={t("voucher")} labelHint={tYearEnd("optional")} error={errors.voucherNo?.message}>
        <Input id="depreciation-voucher" {...register("voucherNo")} readOnly={isBusy} error={!!errors.voucherNo} className="min-h-11" />
      </FormField>
      <FormField id="depreciation-note" label={t("note")} labelHint={tYearEnd("optional")} error={errors.description?.message}>
        <Textarea id="depreciation-note" {...register("description")} readOnly={isBusy} error={!!errors.description} rows={2} />
      </FormField>
      <p className="text-xs text-app-text-muted">{t("hint")}</p>
    </Dialog>
  );
}
