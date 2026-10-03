"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, Info } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa, takaToPaisa, TAKA_INPUT_PATTERN } from "@/lib/money";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useCreateTransfer } from "../hooks/use-collection-mutations";
import { useCashAccounts, useCashBalance } from "../hooks/use-collection-queries";
import { TRANSFER_FIELDS, transferSchema, toTransferPayload, type TransferInput } from "../schemas";

type TransferDialogProps = { open: boolean; onClose: () => void };

// POST /transactions/transfer: money between two samiti accounts (নগদ → ব্যাংক).
// Two linked rows; the total stays the same. The parent passes a new `key` on each open.
export function TransferDialog({ open, onClose }: TransferDialogProps) {
  const t = useTranslations("TransferForm");
  const tForm = useTranslations("TransactionForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const createTransfer = useCreateTransfer();
  const runLocked = useSubmitLock();
  const accounts = useCashAccounts();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema(tForm, t)),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      transactionDate: toDhakaDateString(),
      voucherNo: "",
      description: "",
    },
    mode: "onTouched",
  });

  const [fromAccountId, toAccountId, amount] = useWatch({ control, name: ["fromAccountId", "toAccountId", "amount"] });
  const fromBalance = useCashBalance(fromAccountId);
  const activeAccounts = (accounts.data ?? []).filter((account) => account.status === "active");
  const fromAccount = activeAccounts.find((account) => account._id === fromAccountId);
  const toAccount = activeAccounts.find((account) => account._id === toAccountId);
  const isBusy = isSubmitting || createTransfer.isPending;
  const hasTooFewAccounts = accounts.isSuccess && activeAccounts.length < 2;

  const fromOptions = activeAccounts.map((account) => ({ value: account._id, label: account.name }));
  const toOptions = activeAccounts
    .filter((account) => account._id !== fromAccountId)
    .map((account) => ({ value: account._id, label: account.name }));
  const balanceText = fromBalance.data ? t("fromBalance", { balance: formatPaisa(fromBalance.data.balance, locale) }) : "";

  const amountText = amount.trim();
  const hasAmount = TAKA_INPUT_PATTERN.test(amountText) && Number(amountText) > 0;
  const summary =
    hasAmount && fromAccount && toAccount
      ? t("summary", {
          amount: formatPaisa(takaToPaisa(amountText), locale),
          from: fromAccount.name,
          to: toAccount.name,
        })
      : "";

  const save = async (values: TransferInput) => {
    setFormError(null);
    try {
      const result = await createTransfer.mutateAsync(toTransferPayload(values));
      onClose();
      toast.success(
        t("success", { outNo: result.transferOut.transactionNo, inNo: result.transferIn.transactionNo }),
      );
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, TRANSFER_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof TransferInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: TransferInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);
  const fieldProps = (name: keyof TransferInput) => ({
    id: `transfer-${name}`,
    error: !!errors[name],
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `transfer-${name}-error` : undefined,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      closeLabel={tForm("close")}
      dismissible={!isBusy}
      size="lg"
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={tForm("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? tForm("submitting") : t("submit")}
          isBusy={isBusy}
          actionDisabled={hasTooFewAccounts}
        />
      }
    >
      {formError && <FormAlert message={formError} />}
      {hasTooFewAccounts && <FormAlert message={t("needTwoAccounts")} />}

      <div className="space-y-2">
        <FormField id="transfer-fromAccountId" label={t("from")} error={errors.fromAccountId?.message}>
          <Controller
            control={control}
            name="fromAccountId"
            render={({ field }) => (
              <SelectMenu
                id="transfer-fromAccountId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={fromOptions}
                placeholder={tForm("fields.accountPlaceholder")}
                disabled={isBusy}
                error={!!errors.fromAccountId}
                aria-describedby={errors.fromAccountId ? "transfer-fromAccountId-error" : undefined}
              />
            )}
          />
          {balanceText && <p className="mt-1.5 text-xs text-app-text-muted">{balanceText}</p>}
        </FormField>

        <div className="flex justify-center text-app-text-muted" aria-hidden="true">
          <ArrowDown className="h-5 w-5" />
        </div>

        <FormField id="transfer-toAccountId" label={t("to")} error={errors.toAccountId?.message}>
          <Controller
            control={control}
            name="toAccountId"
            render={({ field }) => (
              <SelectMenu
                id="transfer-toAccountId"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={toOptions}
                placeholder={tForm("fields.accountPlaceholder")}
                disabled={isBusy}
                error={!!errors.toAccountId}
                aria-describedby={errors.toAccountId ? "transfer-toAccountId-error" : undefined}
              />
            )}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="transfer-amount" label={tForm("fields.amount")} error={errors.amount?.message}>
          <Input
            {...fieldProps("amount")}
            {...register("amount")}
            inputMode="decimal"
            autoComplete="off"
            readOnly={isBusy}
            placeholder={tForm("fields.amountPlaceholder")}
            className="min-h-11 text-right text-base font-semibold tabular-nums"
          />
        </FormField>
        <FormField id="transfer-transactionDate" label={tForm("fields.date")} error={errors.transactionDate?.message}>
          <Input
            {...fieldProps("transactionDate")}
            {...register("transactionDate")}
            type="date"
            max={toDhakaDateString()}
            readOnly={isBusy}
            className="min-h-11"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <FormField
          id="transfer-voucherNo"
          label={tForm("fields.voucherNo")}
          labelHint={tForm("fields.optional")}
          error={errors.voucherNo?.message}
        >
          <Input {...fieldProps("voucherNo")} {...register("voucherNo")} maxLength={30} readOnly={isBusy} className="min-h-11" />
        </FormField>
        <FormField
          id="transfer-description"
          label={tForm("fields.description")}
          labelHint={tForm("fields.optional")}
          error={errors.description?.message}
        >
          <Textarea {...fieldProps("description")} {...register("description")} rows={1} maxLength={200} readOnly={isBusy} className="min-h-11" />
        </FormField>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-sky-50 p-3 text-xs text-sky-900">
        <Info aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t("note")}
      </p>

      {summary && (
        <p className="rounded-xl border border-app-primary/30 bg-app-primary/5 p-3 text-sm font-medium text-app-text">
          {summary}
        </p>
      )}
    </Dialog>
  );
}
