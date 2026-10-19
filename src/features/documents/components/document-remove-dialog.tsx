"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { useToast } from "@/components/shared/toast/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      onConfirm={() => void runLocked(remove)}
      title={t("removeTitle", { name: label })}
      description={t("removeDescription")}
      cancelLabel={t("cancel")}
      confirmLabel={t("removeSubmit")}
      busyLabel={t("removing")}
      confirmIcon={Trash2}
      isBusy={isBusy}
      error={formError}
    />
  );
}
