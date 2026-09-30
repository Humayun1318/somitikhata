"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock } from "lucide-react";

import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getCollectionError } from "../collection-errors";
import { useReverseTransaction } from "../hooks/use-collection-mutations";
import { typeName } from "../transaction-effects";
import type { Transaction } from "../types";

import { FormAlert } from "@/components/shared/form-alert";

type ReverseDialogProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction;
};

// Same limits as the backend reversalZodSchema.
const REASON_MIN = 5;
const REASON_MAX = 200;

// POST /transactions/reverse. The parent passes a new `key` each time it opens.
export function ReverseDialog({ open, onClose, transaction }: ReverseDialogProps) {
  const t = useTranslations("ReverseForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const reverse = useReverseTransaction();
  const runLocked = useSubmitLock();

  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = reverse.isPending;

  const save = async () => {
    setFormError(null);
    const text = reason.trim();
    if (text.length < REASON_MIN) return setReasonError(t("reasonShort"));
    if (text.length > REASON_MAX) return setReasonError(t("reasonLong"));
    setReasonError(null);

    try {
      const created = await reverse.mutateAsync({ transactionNo: transaction.transactionNo, reason: text });
      onClose();
      toast.success(t("success", { original: transaction.transactionNo, reversal: created.transactionNo }));
    } catch (error) {
      const result = getCollectionError(error, tErrors, locale, ["reason"]);
      if (result.fieldErrors[0]) setReasonError(result.fieldErrors[0].message);
      setFormError(result.formError);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLocked(save);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description", { transactionNo: transaction.transactionNo })}
      closeLabel={t("close")}
      dismissible={!isBusy}
    >
      <form onSubmit={submitForm} noValidate aria-busy={isBusy} className="space-y-4">
        {formError && <FormAlert message={formError} />}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-app-surface-muted/60 p-3 text-sm">
          <span className="min-w-0">
            <span className="block truncate font-medium text-app-text">{typeName(transaction.transactionType, locale)}</span>
            <span className="font-mono text-xs text-app-text-muted">{transaction.transactionNo}</span>
          </span>
          <Money paisa={transaction.amount} className="font-semibold text-app-text" />
        </div>

        <FormField id="reverse-reason" label={t("reason")} error={reasonError ?? undefined}>
          <Textarea
            id="reverse-reason"
            value={reason}
            maxLength={REASON_MAX}
            readOnly={isBusy}
            error={!!reasonError}
            aria-invalid={!!reasonError}
            aria-describedby={reasonError ? "reverse-reason-error" : undefined}
            placeholder={t("reasonPlaceholder")}
            onChange={(event) => setReason(event.target.value)}
            data-autofocus
          />
        </FormField>

        <p className="flex items-center gap-2 text-xs text-app-text-muted">
          <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
          {t("dateNote")}
        </p>

        <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isBusy} className="w-full sm:w-auto">
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isBusy} className="w-full bg-red-600 hover:bg-red-700 sm:w-auto">
            {isBusy ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
