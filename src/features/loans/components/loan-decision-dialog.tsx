"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

import { FormAlert } from "@/components/shared/form-alert";
import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useDecideLoan } from "../hooks/use-loans";
import { getLoanError } from "../loan-errors";
import type { Loan } from "../types";

export type LoanDecision = "approve" | "reject";

type LoanDecisionDialogProps = { open: boolean; onClose: () => void; loan: Loan; decision: LoanDecision };

// Same limits as approveLoanZodSchema / rejectLoanZodSchema.
const NOTE_MAX = 200;
const REJECT_NOTE_MIN = 5;

// PATCH /loans/:loanNo/approve | reject. Approving re-checks the member's
// eligible amount on the server; rejecting needs a reason.
export function LoanDecisionDialog({ open, onClose, loan, decision }: LoanDecisionDialogProps) {
  const t = useTranslations("Loans");
  const tErrors = useTranslations("LoanErrors");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const decide = useDecideLoan();
  const runLocked = useSubmitLock();
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isReject = decision === "reject";
  const isBusy = decide.isPending;

  const save = async () => {
    setFormError(null);
    const text = note.trim();
    if (isReject && text.length < REJECT_NOTE_MIN) return setNoteError(t("validation.reasonShort"));
    if (text.length > NOTE_MAX) return setNoteError(t("validation.noteLong"));
    setNoteError(null);

    try {
      await decide.mutateAsync({ loanNo: loan.loanNo, decision, payload: text ? { decisionNote: text } : {} });
      onClose();
      toast.success(t(isReject ? "rejectedToast" : "approvedToast", { loanNo: loan.loanNo }));
    } catch (error) {
      const result = getLoanError(error, tErrors, tCollections, locale, ["decisionNote"]);
      if (result.fieldErrors[0]) setNoteError(result.fieldErrors[0].message);
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
      title={t(isReject ? "rejectTitle" : "approveTitle", { loanNo: loan.loanNo })}
      description={t(isReject ? "rejectDescription" : "approveDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("saving") : t(isReject ? "reject" : "approve")}
          tone={isReject ? "danger" : "primary"}
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <div className="flex items-center justify-between gap-3 rounded-xl bg-app-surface-muted/60 p-3 text-sm">
        <span className="min-w-0">
          <span className="block truncate font-medium text-app-text">{loan.member.nameBn}</span>
          <span className="font-mono text-xs text-app-text-muted">{loan.member.memberNo}</span>
        </span>
        <Money paisa={loan.principal} className="font-semibold text-app-text" />
      </div>

      <FormField
        id="loan-decision-note"
        label={isReject ? t("fields.reason") : t("fields.note")}
        labelHint={isReject ? undefined : t("optional")}
        error={noteError ?? undefined}
      >
        <Textarea
          id="loan-decision-note"
          value={note}
          maxLength={NOTE_MAX}
          readOnly={isBusy}
          error={!!noteError}
          aria-invalid={!!noteError}
          aria-describedby={noteError ? "loan-decision-note-error" : undefined}
          onChange={(event) => setNote(event.target.value)}
          data-autofocus
        />
      </FormField>
    </Dialog>
  );
}
