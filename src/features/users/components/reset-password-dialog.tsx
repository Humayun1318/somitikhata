"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, LogOut, Smartphone, TriangleAlert, UserCheck } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useResetPassword } from "../hooks/use-user-account-mutations";
import type { AccountTarget } from "../types";
import { getUserActionError } from "../user-action-errors";

type ResetPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  account: AccountTarget;
};

// PATCH /user/reset-password/:id. The backend sets the password back to the
// mobile number registered on the account and makes the user choose a new one
// after signing in. No password is typed, shown or sent from here.
// The admin must confirm they checked who is asking before the button works.
// The parent passes a new `key` on each open, so the checkbox starts unticked.
export function ResetPasswordDialog({ open, onClose, account }: ResetPasswordDialogProps) {
  const t = useTranslations("UserAccount");
  const toast = useToast();
  const resetPassword = useResetPassword();
  const runLocked = useSubmitLock();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = resetPassword.isPending;
  const name = account.identifier ? `${account.name} (${account.identifier})` : account.name;
  const steps = [
    { key: "password", Icon: Smartphone },
    { key: "change", Icon: KeyRound },
    { key: "signOut", Icon: LogOut },
  ] as const;

  const reset = async () => {
    setFormError(null);
    try {
      await resetPassword.mutateAsync(account.id);
      onClose();
      toast.success(t("reset.success", { name: account.name }));
    } catch (error) {
      setFormError(getUserActionError(error, t, "errors.resetGeneric"));
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConfirmed) return;
    void runLocked(reset);
  };
  const toggleConfirmed = () => setIsConfirmed((value) => !value);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("reset.title")}
      description={t("reset.description", { name })}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("reset.submitting") : t("reset.submit")}
          actionIcon={KeyRound}
          tone="danger"
          isBusy={isBusy}
          actionDisabled={!isConfirmed}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <div className="rounded-xl bg-app-surface-muted/60 p-4">
        <p className="text-sm font-semibold text-app-text">{t("reset.whatHappens")}</p>
        <ul className="mt-2.5 space-y-2">
          {steps.map(({ key, Icon }) => (
            <li key={key} className="flex items-start gap-2.5 text-sm text-app-text">
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-app-primary" />
              {t(`reset.steps.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-app-text-muted">{t(`reset.signInHint.${account.kind}`)}</p>

      {account.status !== "active" && (
        <p
          role="note"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          {t("reset.notActive", { status: t(`status.${account.status}`) })}
        </p>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-app-border p-3 transition-colors hover:bg-app-surface-muted/60">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={toggleConfirmed}
          disabled={isBusy}
          className="mt-0.5 h-4 w-4 accent-app-primary"
        />
        <span className="flex items-start gap-2 text-sm text-app-text">
          <UserCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-app-text-muted" />
          {t("reset.confirm", { name: account.name })}
        </span>
      </label>
    </Dialog>
  );
}
