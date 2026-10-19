"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";

import { Dialog } from "./dialog";
import { DialogActions } from "./dialog-actions";

type ConfirmDialogProps = {
  open: boolean;
  /** Cancel, Esc, backdrop and X (all blocked while `isBusy`). */
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  /** Defaults to "Confirm" / "নিশ্চিত করুন". */
  confirmLabel?: string;
  /** Shown on the confirm button while `isBusy`. Defaults to "Please wait…". */
  busyLabel?: string;
  /** Defaults to "Cancel" / "বাতিল". */
  cancelLabel?: string;
  confirmIcon?: LucideIcon;
  /** "danger" (default) for deleting, closing or blocking; "primary" otherwise. */
  tone?: "danger" | "primary";
  /** The request is running: the buttons show a spinner and the dialog can't close. */
  isBusy?: boolean;
  /** An error from the last attempt, shown above the body. */
  error?: string | null;
  /** Extra body: what exactly will happen (a warning, the record's details). */
  children?: ReactNode;
};

/**
 * The one "Are you sure?" dialog for consequential actions: deleting a
 * record or an image, closing an account or head, blocking a login, and
 * the like. Not for harmless actions. It only asks; the caller runs the
 * action in `onConfirm`, sets `isBusy` while it runs and closes on success.
 *
 *   <ConfirmDialog
 *     open={open}
 *     title={t("closeTitle", { name })}
 *     description={t("closeDescription")}
 *     confirmLabel={t("closeSubmit")}
 *     isBusy={mutation.isPending}
 *     error={error}
 *     onCancel={() => setOpen(false)}
 *     onConfirm={() => void runLocked(close)}
 *   />
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel,
  busyLabel,
  cancelLabel,
  confirmIcon,
  tone = "danger",
  isBusy = false,
  error,
  children,
}: ConfirmDialogProps) {
  const t = useTranslations("ConfirmDialog");

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      closeLabel={t("close")}
      dismissible={!isBusy}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={cancelLabel ?? t("cancel")}
          onCancel={onCancel}
          actionLabel={isBusy ? (busyLabel ?? t("working")) : (confirmLabel ?? t("confirm"))}
          actionIcon={confirmIcon}
          onAction={onConfirm}
          tone={tone}
          isBusy={isBusy}
        />
      }
    >
      {error && <FormAlert message={error} />}
      {/* In the body (not under the title), so the dialog never has an empty middle */}
      {description && <p className="text-sm leading-relaxed text-app-text">{description}</p>}
      {children}
    </Dialog>
  );
}
