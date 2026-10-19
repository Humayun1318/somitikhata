"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { FormAlert } from "@/components/shared/form-alert";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { useSubmitLock } from "@/lib/use-submit-lock";

import { getDocumentError } from "../document-errors";
import { useRemoveDocument } from "../hooks/use-document-mutations";
import type { DocumentKind, DocumentOwner } from "../types";

type DocumentRemoveDialogProps = {
  open: boolean;
  onClose: () => void;
  owner: DocumentOwner;
  kind: DocumentKind;
  label: string;
};

// DELETE /documents/...: permanent, so it asks first (office only).
export function DocumentRemoveDialog({ open, onClose, owner, kind, label }: DocumentRemoveDialogProps) {
  const t = useTranslations("Documents");
  const toast = useToast();
  const removeDocument = useRemoveDocument(owner);
  const runLocked = useSubmitLock();
  const [formError, setFormError] = useState<string | null>(null);
  const isBusy = removeDocument.isPending;

  const remove = async () => {
    setFormError(null);
    try {
      await removeDocument.mutateAsync(kind);
      onClose();
      toast.success(t("removeSuccess", { name: label }));
    } catch (error) {
      setFormError(getDocumentError(error, t, "errors.removeGeneric"));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("removeTitle", { name: label })}
      description={t("removeDescription")}
      closeLabel={t("close")}
      dismissible={!isBusy}
      busy={isBusy}
      footer={
        <DialogActions
          cancelLabel={t("cancel")}
          onCancel={onClose}
          actionLabel={isBusy ? t("removing") : t("removeSubmit")}
          actionIcon={Trash2}
          onAction={() => void runLocked(remove)}
          tone="danger"
          isBusy={isBusy}
        />
      }
    >
      {formError && <FormAlert message={formError} />}
    </Dialog>
  );
}
