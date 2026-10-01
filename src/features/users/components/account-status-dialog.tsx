"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { cn } from "@/lib/cn";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useUpdateAccountStatus } from "../hooks/use-user-account-mutations";
import { ACCOUNT_STATUSES, type AccountStatus, type AccountTarget } from "../types";
import { getUserActionError } from "../user-action-errors";

import { AccountStatusBadge } from "./account-status-badge";

type AccountStatusDialogProps = {
  open: boolean;
  onClose: () => void;
  account: AccountTarget;
};

// PATCH /user/update-status/:id. Used for admins (a member's login status
// follows the member status instead). Only "active" can sign in; the backend
// checks it on every request, so a change takes effect right away.
// The parent passes a new `key` on each open, so the choice starts fresh.
export function AccountStatusDialog({ open, onClose, account }: AccountStatusDialogProps) {
  const t = useTranslations("UserAccount");
  const toast = useToast();
  const updateStatus = useUpdateAccountStatus();
  const runLocked = useSubmitLock();
  const [status, setStatus] = useState<AccountStatus>(account.status);
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = updateStatus.isPending;
  const isUnchanged = status === account.status;
  const blocksLogin = status !== "active";
  const name = account.identifier ? `${account.name} (${account.identifier})` : account.name;

  const save = async () => {
    setFormError(null);
    try {
      await updateStatus.mutateAsync({ id: account.id, status });
      onClose();
      toast.success(t("statusForm.success", { name: account.name, status: t(`status.${status}`) }));
    } catch (error) {
      setFormError(getUserActionError(error, t, "errors.statusGeneric"));
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLocked(save);
  };

  const submitLabel = isBusy ? t("statusForm.submitting") : t(`statusForm.submit.${status}`);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("statusForm.title")}
      description={t("statusForm.description", { name })}
      closeLabel={t("close")}
      dismissible={!isBusy}
      onSubmit={submitForm}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={submitLabel}
          tone={blocksLogin ? "danger" : "primary"}
          isBusy={isBusy}
          actionDisabled={isUnchanged}
        />
      }
    >
      {formError && <FormAlert message={formError} />}

      <fieldset className="space-y-2" disabled={isBusy}>
        <legend className="sr-only">{t("statusForm.title")}</legend>
        {ACCOUNT_STATUSES.map((option) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
              status === option ? "border-app-primary bg-app-primary/5" : "border-app-border hover:bg-app-surface-muted/60",
            )}
          >
            <input
              type="radio"
              name="account-status"
              value={option}
              checked={status === option}
              onChange={() => setStatus(option)}
              className="mt-1 h-4 w-4 accent-app-primary"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <AccountStatusBadge status={option} />
                {option === account.status && (
                  <span className="text-xs font-medium text-app-text-muted">{t("statusForm.current")}</span>
                )}
              </span>
              <span className="mt-1 block text-xs text-app-text-muted">{t(`statusForm.effects.${option}`)}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {!isUnchanged && blocksLogin && (
        <p
          role="note"
          className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          {t("statusForm.blockWarning", { name: account.name })}
        </p>
      )}
    </Dialog>
  );
}
