"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, UserPlus, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useMemberNominees } from "../hooks/use-member-nominees";
import { MAX_NOMINEES, MIN_NOMINEES, type Nominee } from "../types";

import { NomineeCard } from "./nominee-card";
import { NomineeDeleteDialog } from "./nominee-delete-dialog";
import { NomineeFormDialog } from "./nominee-form-dialog";

type MemberNomineesSectionProps = {
  memberNo: string;
  /** e.g. "রহিম উদ্দিন (LBKS-0001)", shown in the nominee dialogs. */
  memberLabel: string;
  /** Load only while the details dialog is open. */
  enabled?: boolean;
};

type OpenDialog = { type: "form" | "delete"; nominee: Nominee | null; key: number } | null;

// The nominee part of Member details (admin): the 1–2 nominees as cards, with
// Add / Edit / Delete. The add/edit and delete dialogs open on top of the details.
export function MemberNomineesSection({ memberNo, memberLabel, enabled = true }: MemberNomineesSectionProps) {
  const t = useTranslations("Nominees");
  const { data: nominees, isPending, isError, isFetching, refetch } = useMemberNominees(memberNo, enabled);
  const [dialog, setDialog] = useState<OpenDialog>(null);
  // Kept after closing, so the dialog doesn't change while it animates out.
  const [lastDialog, setLastDialog] = useState<NonNullable<OpenDialog> | null>(null);

  const count = nominees?.length ?? 0;
  const canAdd = !!nominees && count < MAX_NOMINEES;
  const isLastOne = count <= MIN_NOMINEES;
  const deleteDisabledReason = isLastOne ? t("section.keepOne") : undefined;
  const shown = dialog ?? lastDialog;

  const open = (type: "form" | "delete", nominee: Nominee | null = null) => {
    const next = { type, nominee, key: (lastDialog?.key ?? 0) + 1 };
    setDialog(next);
    setLastDialog(next);
  };
  const close = () => setDialog(null);
  const openAdd = () => open("form");
  const retry = () => void refetch();

  return (
    <section aria-labelledby="member-nominees-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <UsersRound aria-hidden="true" className="h-4 w-4 text-app-primary" />
          <h3 id="member-nominees-title" className="text-sm font-semibold text-app-text">
            {t("section.title")}
          </h3>
          {nominees && (
            <span className="rounded-full bg-app-surface-muted px-2 py-0.5 text-xs font-medium text-app-text-muted">
              {t("section.count", { count, max: MAX_NOMINEES })}
            </span>
          )}
        </div>
        {canAdd && (
          <Button type="button" variant="outline" onClick={openAdd} className="min-h-9 gap-1.5 px-3 text-xs">
            <UserPlus aria-hidden="true" className="h-3.5 w-3.5" />
            {t("section.add")}
          </Button>
        )}
      </div>

      {isPending && <div aria-busy="true" className="h-28 animate-pulse rounded-2xl bg-app-surface-muted" />}

      {isError && !nominees && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span className="inline-flex items-center gap-2">
            <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
            {t("section.error")}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={retry}
            isLoading={isFetching}
            className="min-h-9 px-3 text-xs"
          >
            {t("section.retry")}
          </Button>
        </div>
      )}

      {nominees && count === 0 && (
        <p className="rounded-2xl border border-dashed border-app-border p-4 text-sm text-app-text-muted">
          {t("section.empty")}
        </p>
      )}

      {nominees && count > 0 && (
        <div className="space-y-3">
          {nominees.map((nominee, index) => (
            <NomineeCard
              key={nominee._id}
              nominee={nominee}
              index={index}
              onEdit={() => open("form", nominee)}
              onDelete={() => open("delete", nominee)}
              deleteDisabledReason={deleteDisabledReason}
            />
          ))}
          {isLastOne && <p className="text-xs text-app-text-muted">{t("section.keepOneHint")}</p>}
        </div>
      )}

      {shown?.type === "form" && (
        <NomineeFormDialog
          key={`nominee-form-${shown.key}`}
          open={dialog?.type === "form"}
          onClose={close}
          memberNo={memberNo}
          memberLabel={memberLabel}
          nominee={shown.nominee}
        />
      )}
      {shown?.type === "delete" && shown.nominee && (
        <NomineeDeleteDialog
          key={`nominee-delete-${shown.key}`}
          open={dialog?.type === "delete"}
          onClose={close}
          memberNo={memberNo}
          nominee={shown.nominee}
        />
      )}
    </section>
  );
}
