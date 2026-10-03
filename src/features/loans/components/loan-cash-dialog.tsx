"use client";

import { useState, type FormEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { FormAlert } from "@/components/shared/form-alert";
import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { useCashAccounts } from "@/features/collections/hooks/use-collection-queries";
import { DHAKA_TIME_ZONE, toDhakaDateString } from "@/lib/dhaka-date";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useDisburseLoan, useRepayInstallment } from "../hooks/use-loans";
import { getLoanError } from "../loan-errors";
import { loanCashSchema, toLoanCashPayload, type LoanCashInput } from "../schemas";
import type { Loan, LoanInstallment } from "../types";

export type LoanCashMode = "disburse" | "repay";

type LoanCashDialogProps = {
  open: boolean;
  onClose: () => void;
  loan: Loan;
  mode: LoanCashMode;
  /** The installment a repayment settles (always the next pending one). */
  nextInstallment?: LoanInstallment;
};

const CASH_FIELDS: (keyof LoanCashInput)[] = ["cashAccountId", "transactionDate"];

// POST /loans/:loanNo/disburse (cash out, schedule made) or
// /repay-next-installment (cash in: principal + interest as two rows).
export function LoanCashDialog({ open, onClose, loan, mode, nextInstallment }: LoanCashDialogProps) {
  const t = useTranslations("Loans");
  const tErrors = useTranslations("LoanErrors");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const format = useFormatter();
  const toast = useToast();
  const disburse = useDisburseLoan();
  const repay = useRepayInstallment();
  const runLocked = useSubmitLock();
  const accounts = useCashAccounts();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoanCashInput>({
    resolver: zodResolver(loanCashSchema(t)),
    defaultValues: { cashAccountId: "", transactionDate: toDhakaDateString() },
    mode: "onTouched",
  });

  const isRepay = mode === "repay";
  const isBusy = isSubmitting || disburse.isPending || repay.isPending;
  const accountOptions = (accounts.data ?? [])
    .filter((account) => account.status === "active")
    .map((account) => ({ value: account._id, label: account.name }));
  const installmentTotal = nextInstallment ? nextInstallment.principalDue + nextInstallment.interestDue : 0;
  const installmentTitle = nextInstallment
    ? t("installmentOf", {
        number: format.number(nextInstallment.installmentNo),
        date: format.dateTime(new Date(nextInstallment.dueDate), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }),
      })
    : "";

  const save = async (values: LoanCashInput) => {
    setFormError(null);
    try {
      const payload = toLoanCashPayload(values);
      if (isRepay) await repay.mutateAsync({ loanNo: loan.loanNo, payload });
      else await disburse.mutateAsync({ loanNo: loan.loanNo, payload });
      onClose();
      toast.success(t(isRepay ? "collectedToast" : "disbursedToast", { loanNo: loan.loanNo }));
    } catch (error) {
      const result = getLoanError(error, tErrors, tCollections, locale, CASH_FIELDS);
      result.fieldErrors.forEach(({ field, message }, index) => {
        setError(field as keyof LoanCashInput, { type: "server", message }, { shouldFocus: index === 0 });
      });
      setFormError(result.formError);
    }
  };

  const onSubmit = (values: LoanCashInput) => runLocked(() => save(values));
  const submitForm = (event: FormEvent<HTMLFormElement>) => handleSubmit(onSubmit)(event);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t(isRepay ? "collectTitle" : "disburseTitle", { loanNo: loan.loanNo })}
      description={t(isRepay ? "collectDescription" : "disburseDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("saving") : t(isRepay ? "collect" : "disburse")}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      {!isRepay && (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-app-surface-muted/60 p-3 text-sm">
          <span className="min-w-0">
            <span className="block truncate font-medium text-app-text">{loan.member.nameBn}</span>
            <span className="font-mono text-xs text-app-text-muted">{loan.member.memberNo}</span>
          </span>
          <Money paisa={loan.principal} className="text-lg font-bold text-red-700" />
        </div>
      )}

      {isRepay && nextInstallment && (
        <div className="space-y-1.5 rounded-xl bg-app-surface-muted/60 p-3 text-sm">
          <p className="font-medium text-app-text">{installmentTitle}</p>
          <p className="flex justify-between text-app-text-muted">
            {t("columns.principalDue")} <Money paisa={nextInstallment.principalDue} className="text-app-text" />
          </p>
          <p className="flex justify-between text-app-text-muted">
            {t("columns.interestDue")} <Money paisa={nextInstallment.interestDue} className="text-app-text" />
          </p>
          <p className="flex justify-between border-t border-app-border pt-1.5 font-semibold text-app-text">
            {t("collectTotal")} <Money paisa={installmentTotal} className="text-emerald-700" />
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="loan-cash-account" label={t("fields.account")} error={errors.cashAccountId?.message}>
          <Controller
            control={control}
            name="cashAccountId"
            render={({ field }) => (
              <SelectMenu
                id="loan-cash-account"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={accountOptions}
                placeholder={t("fields.accountPlaceholder")}
                disabled={isBusy}
                error={!!errors.cashAccountId}
                aria-describedby={errors.cashAccountId ? "loan-cash-account-error" : undefined}
              />
            )}
          />
        </FormField>
        <FormField id="loan-cash-date" label={t("fields.date")} error={errors.transactionDate?.message}>
          <Input
            id="loan-cash-date"
            {...register("transactionDate")}
            type="date"
            max={toDhakaDateString()}
            readOnly={isBusy}
            error={!!errors.transactionDate}
            aria-invalid={!!errors.transactionDate}
            aria-describedby={errors.transactionDate ? "loan-cash-date-error" : undefined}
            className="min-h-11"
          />
        </FormField>
      </div>

      <p className="text-xs text-app-text-muted">{t(isRepay ? "collectNote" : "disburseNote")}</p>
    </Dialog>
  );
}
