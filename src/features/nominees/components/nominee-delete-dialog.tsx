"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
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
    <Dialog
      open={open}
      onClose={onClose}
      title={t("delete.title")}
      description={t("delete.description", { name: nominee.name })}
      closeLabel={t("close")}
      dismissible={!isBusy}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("delete.submitting") : t("delete.submit")}
          actionIcon={Trash2}
          onAction={confirm}
          tone="danger"
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}
      <p className="text-sm text-app-text-muted">{t("delete.warning")}</p>
    </Dialog>
  );
}
