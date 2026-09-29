"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-errors";
import { toDhakaDateString } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useUpdateMemberStatus } from "../hooks/use-update-member-status";
import { getMemberFormErrors } from "../member-form-errors";
import { MEMBER_STATUSES, type Member, type MemberStatus } from "../types";

import { MemberStatusBadge } from "./member-status-badge";

type MemberStatusDialogProps = {
  open: boolean;
  onClose: () => void;
  member: Member;
};

type ErrorBody = { errorSources?: { path?: string; message?: string }[] };

// Backend Zod error for the exit date, e.g. "Exit date is required when status is exited".
function getExitDateError(error: unknown) {
  if (!(error instanceof ApiError)) return null;
  const sources = (error.details as ErrorBody | undefined)?.errorSources ?? [];
  return sources.find(({ path }) => path === "exitDate")?.message ?? null;
}

// Uses the dedicated PATCH /member/update-status/:memberNo API.
// The parent passes a new `key` each time it opens, so the choice starts fresh.
export function MemberStatusDialog({ open, onClose, member }: MemberStatusDialogProps) {
  const t = useTranslations("MemberStatusForm");
  const tStatus = useTranslations("Members.status");
  const toast = useToast();
  const updateStatus = useUpdateMemberStatus();
  const runLocked = useSubmitLock();

  const savedExitDate = member.exitDate ? toDhakaDateString(member.exitDate) : "";
  const [status, setStatus] = useState<MemberStatus>(member.status);
  const [exitDate, setExitDate] = useState(savedExitDate || toDhakaDateString());
  const [exitDateError, setExitDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = updateStatus.isPending;
  const isExited = status === "exited";
  // Nothing to save, unless an exited member's exit date is being corrected.
  const isUnchanged = status === member.status && (!isExited || exitDate === savedExitDate);
  const today = toDhakaDateString();

  const saveStatus = async () => {
    setFormError(null);
    setExitDateError(null);

    // Same rules as the backend: exit date only for "exited", required, not in the future.
    if (isExited && !exitDate) {
      setExitDateError(t("exitDateRequired"));
      return;
    }
    if (isExited && exitDate > today) {
      setExitDateError(t("dateInFuture"));
      return;
    }

    try {
      await updateStatus.mutateAsync({
        memberNo: member.memberNo,
        payload: { status, ...(isExited && { exitDate }) },
      });
      onClose();
      toast.success(t("success", { memberNo: member.memberNo, status: tStatus(status) }));
    } catch (error) {
      const exitDateMessage = getExitDateError(error);
      if (exitDateMessage) {
        setExitDateError(exitDateMessage);
        return;
      }
      setFormError(getMemberFormErrors(error, t).formError ?? t("errors.generic"));
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLocked(saveStatus);
  };

  const submitLabel = isBusy ? t("submitting") : t("submit");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      description={t("description", { name: member.nameBn, memberNo: member.memberNo })}
      closeLabel={t("close")}
      dismissible={!isBusy}
    >
      <form onSubmit={submitForm} noValidate aria-busy={isBusy} className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        <fieldset className="space-y-2" disabled={isBusy}>
          <legend className="sr-only">{t("title")}</legend>
          {MEMBER_STATUSES.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                status === option
                  ? "border-app-primary bg-app-primary/5"
                  : "border-app-border hover:bg-app-surface-muted/60",
              )}
            >
              <input
                type="radio"
                name="status"
                value={option}
                checked={status === option}
                onChange={() => setStatus(option)}
                className="mt-1 h-4 w-4 accent-app-primary"
              />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <MemberStatusBadge status={option} />
                  {option === member.status && (
                    <span className="text-xs font-medium text-app-text-muted">{t("current")}</span>
                  )}
                </span>
                <span className="mt-1 block text-xs text-app-text-muted">{t(`effects.${option}`)}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {isExited && (
          <FormField id="exitDate" label={t("exitDate")} error={exitDateError ?? undefined}>
            <Input
              id="exitDate"
              type="date"
              max={today}
              value={exitDate}
              readOnly={isBusy}
              error={!!exitDateError}
              aria-invalid={!!exitDateError}
              aria-describedby={exitDateError ? "exitDate-error" : undefined}
              onChange={(event) => setExitDate(event.target.value)}
              className="min-h-11"
            />
          </FormField>
        )}

        <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isBusy}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button type="submit" isLoading={isBusy} disabled={isUnchanged} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
