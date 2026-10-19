"use client";

import { useTranslations } from "next-intl";

import { Dialog } from "@/components/ui/dialog";

import type { DocumentKind, DocumentOwner, StoredFileInfo } from "../types";

import { DocumentImage } from "./document-image";

type DocumentViewerDialogProps = {
  open: boolean;
  onClose: () => void;
  owner: DocumentOwner;
  kind: DocumentKind;
  file: StoredFileInfo;
  /** e.g. "NID (front)" */
  label: string;
};

// The full-size image (e.g. to read an NID), on top of whatever is open.
export function DocumentViewerDialog({ open, onClose, owner, kind, file, label }: DocumentViewerDialogProps) {
  const t = useTranslations("Documents");

  return (
    <Dialog open={open} onClose={onClose} title={label} closeLabel={t("close")} size="lg">
      <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-app-surface-muted">
        <DocumentImage owner={owner} kind={kind} file={file} size="full" alt={label} className="max-h-[70vh]" />
      </div>
    </Dialog>
  );
}
