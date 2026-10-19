"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import { DOCUMENT_KINDS, type DocumentKind, type DocumentOwner, type Documents } from "../types";

import { DocumentRemoveDialog } from "./document-remove-dialog";
import { DocumentSlot } from "./document-slot";
import { DocumentViewerDialog } from "./document-viewer-dialog";

type DocumentsGridProps = {
  owner: DocumentOwner;
  documents?: Documents;
  /** Which slots this user may fill. The backend checks the same rules. */
  canUpload: (kind: DocumentKind) => boolean;
  /** Office only. */
  canRemove?: boolean;
  /** Two columns everywhere (inside a nominee card) instead of four from sm. */
  compact?: boolean;
  /** Footnote under the slots, e.g. who changes the NID. */
  hint?: string;
};

type OpenDialog = { type: "view" | "remove"; kind: DocumentKind; key: number } | null;

// The four image slots of a member or a nominee, plus the viewer and
// remove dialogs they open. Labels say "NID" for a member and "ID" for a
// nominee (who may have a birth certificate or passport instead).
export function DocumentsGrid({ owner, documents = {}, canUpload, canRemove = false, compact, hint }: DocumentsGridProps) {
  const t = useTranslations("Documents");
  const [dialog, setDialog] = useState<OpenDialog>(null);
  // Kept after closing so the dialog doesn't go blank while it animates out
  const [lastDialog, setLastDialog] = useState<NonNullable<OpenDialog> | null>(null);
  const shown = dialog ?? lastDialog;
  const label = (kind: DocumentKind) => t(`kinds.${owner.type}.${kind}`);

  const open = (type: "view" | "remove", kind: DocumentKind) => {
    const next = { type, kind, key: (lastDialog?.key ?? 0) + 1 };
    setDialog(next);
    setLastDialog(next);
  };
  const close = () => setDialog(null);
  const shownFile = shown ? documents[shown.kind] : undefined;

  return (
    <div className="space-y-2">
      <div className={cn("grid grid-cols-2 gap-2", !compact && "sm:grid-cols-4")}>
        {DOCUMENT_KINDS.map((kind) => (
          <DocumentSlot
            key={kind}
            owner={owner}
            kind={kind}
            label={label(kind)}
            file={documents[kind]}
            canUpload={canUpload(kind)}
            canRemove={canRemove}
            onView={() => open("view", kind)}
            onRemove={() => open("remove", kind)}
          />
        ))}
      </div>
      <p className="text-xs text-app-text-muted">
        {hint ? `${hint} ` : ""}
        {DOCUMENT_KINDS.some((kind) => canUpload(kind)) && t("rules")}
      </p>

      {shown?.type === "view" && shownFile && (
        <DocumentViewerDialog
          key={`view-${shown.key}`}
          open={dialog?.type === "view"}
          onClose={close}
          owner={owner}
          kind={shown.kind}
          file={shownFile}
          label={label(shown.kind)}
        />
      )}
      {shown?.type === "remove" && (
        <DocumentRemoveDialog
          key={`remove-${shown.key}`}
          open={dialog?.type === "remove"}
          onClose={close}
          owner={owner}
          kind={shown.kind}
          label={label(shown.kind)}
        />
      )}
    </div>
  );
}
