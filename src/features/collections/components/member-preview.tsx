"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, CircleAlert } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Spinner } from "@/components/ui/spinner";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import type { Member } from "@/features/members/types";

import { balanceOf } from "../transaction-effects";
import type { BucketBalance } from "../types";

type MemberPreviewProps = {
  isLooking: boolean;
  isNotFound: boolean;
  member?: Member;
  balances?: BucketBalance[];
  /** Deposits/withdrawals need an active member; opening entries don't. */
  requireActive?: boolean;
};

// Who the typed member number belongs to, with the balances a deposit or
// withdrawal would change. Shown under the member number field.
export function MemberPreview({ isLooking, isNotFound, member, balances, requireActive = true }: MemberPreviewProps) {
  const t = useTranslations("TransactionForm.member");
  const tBucket = useTranslations("Collections.buckets");

  if (isLooking) {
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-app-text-muted">
        <Spinner className="h-3 w-3" />
        {t("looking")}
      </p>
    );
  }
  if (isNotFound) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
        <CircleAlert aria-hidden="true" className="h-3.5 w-3.5" />
        {t("notFound")}
      </p>
    );
  }
  if (!member) return null;

  const isActive = member.status === "active";

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-app-border bg-app-surface-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-sm">
          <span className="font-semibold text-app-text">{member.nameBn}</span>
          <span className="ml-2 font-mono text-xs text-app-text-muted">{member.memberNo}</span>
        </p>
        <MemberStatusBadge status={member.status} />
      </div>
      {requireActive && !isActive && <p className="text-xs text-red-600">{t("notActive")}</p>}
      {isActive && balances && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-app-text-muted">
          {(["share", "amanot"] as const).map((bucket) => (
            <span key={bucket}>
              {t("balance", { bucket: tBucket(bucket) })}:{" "}
              <Money paisa={balanceOf(balances, bucket)} className="font-semibold text-app-text" />
            </span>
          ))}
          {member.hasShareDeposit && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
              {t("shareDone")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
