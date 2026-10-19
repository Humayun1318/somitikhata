"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, IdCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";

import { useMemberNominees } from "../hooks/use-member-nominees";
import type { Nominee } from "../types";

import { NomineeCard } from "./nominee-card";
import { NomineeFormDialog } from "./nominee-form-dialog";

type MemberNomineeDialogProps = {
  open: boolean;
  onClose: () => void;
  memberNo: string;
  /** e.g. "রহিম উদ্দিন (LBKS-0001)" */
  memberLabel: string;
  /** Opens the full Member details (nominee images, add / delete live there). */
  onOpenDetails: () => void;
};

// The member list's Nominee column: a compact popup with the member's
// nominees (GET /nominee/member/:memberNo) and Edit. Adding, deleting and the
// nominee images stay in Member details, one click away.
export function MemberNomineeDialog({ open, onClose, memberNo, memberLabel, onOpenDetails }: MemberNomineeDialogProps) {
  const t = useTranslations("Nominees");
  const { data: nominees, isPending, isError, isFetching, refetch } = useMemberNominees(memberNo, open);
  // Kept after closing, so the edit dialog doesn't change while it animates out
  const [editing, setEditing] = useState<{ nominee: Nominee; key: number } | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const openEdit = (nominee: Nominee) => {
    setEditing((current) => ({ nominee, key: (current?.key ?? 0) + 1 }));
    setIsEditOpen(true);
  };
  const retry = () => void refetch();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("quick.title")}
      description={memberLabel}
      closeLabel={t("close")}
      footer={
        <DialogActions
          cancelLabel={t("close")}
          onCancel={onClose}
          actionLabel={t("quick.details")}
          actionIcon={IdCard}
          onAction={onOpenDetails}
        />
      }
    >
      {isPending && <div aria-busy="true" className="h-40 animate-pulse rounded-2xl bg-app-surface-muted" />}

      {isError && !nominees && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span className="inline-flex items-center gap-2">
            <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
            {t("section.error")}
          </span>
          <Button type="button" variant="outline" onClick={retry} isLoading={isFetching} className="min-h-9 px-3 text-xs">
            {t("section.retry")}
          </Button>
        </div>
      )}

      {nominees && nominees.length === 0 && (
        <p className="rounded-2xl border border-dashed border-app-border p-4 text-sm text-app-text-muted">
          {t("section.empty")}
        </p>
      )}

      {nominees?.map((nominee, index) => (
        <NomineeCard key={nominee._id} nominee={nominee} index={index} onEdit={() => openEdit(nominee)} />
      ))}

      {editing && (
        <NomineeFormDialog
          key={`quick-nominee-${editing.key}`}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          memberNo={memberNo}
          memberLabel={memberLabel}
          nominee={editing.nominee}
        />
      )}
    </Dialog>
  );
}
