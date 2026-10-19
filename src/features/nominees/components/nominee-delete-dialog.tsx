"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { useDeleteNominee } from "../hooks/use-nominee-mutations";
import { getNomineeFormErrors } from "../nominee-form-errors";
import type { Nominee } from "../types";

type NomineeDeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  memberNo: string;
  nominee: Nominee;
};

// DELETE /nominee/delete/:id. A hard delete, so it asks first.
// The backend refuses to delete a member's last nominee.
export function NomineeDeleteDialog({ open, onClose, memberNo, nominee }: NomineeDeleteDialogProps) {
  const t = useTranslations("Nominees");
  const toast = useToast();
  const deleteNominee = useDeleteNominee(memberNo);
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = deleteNominee.isPending;

  const remove = async () => {
    setFormError(null);
    try {
      await deleteNominee.mutateAsync(nominee._id);
      onClose();
      toast.success(t("delete.success", { name: nominee.name }));
    } catch (error) {
      setFormError(getNomineeFormErrors(error, t, "errors.deleteGeneric").formError);
    }
  };

  const confirm = () => void runLocked(remove);

  return (
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      onConfirm={confirm}
      title={t("delete.title")}
      description={t("delete.description", { name: nominee.name })}
      cancelLabel={t("cancel")}
      confirmLabel={t("delete.submit")}
      busyLabel={t("delete.submitting")}
      confirmIcon={Trash2}
      isBusy={isBusy}
      error={formError}
    >
      <p className="text-sm text-app-text-muted">{t("delete.warning")}</p>
    </ConfirmDialog>
  );
}
