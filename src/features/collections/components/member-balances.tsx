"use client";

import { useFormatter, useTranslations } from "next-intl";
import { BadgeCheck, CircleDashed, CirclePlus } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import type { Member } from "@/features/members/types";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { balanceOf } from "../transaction-effects";
import type { Bucket, BucketBalance } from "../types";

type MemberBalancesProps = {
  member: Member;
  balances?: BucketBalance[];
  isBalancesError: boolean;
  onRecord: () => void;
};

// Share and Amanot always; Fixed Amanot only when the member has some.
function bucketsToShow(balances: BucketBalance[] | undefined): Bucket[] {
  const hasStayi = balanceOf(balances, "stayi") !== 0;
  return hasStayi ? ["share", "amanot", "stayi", "loan"] : ["share", "amanot", "loan"];
}

// Passbook header: who the member is, and their balance in each bucket.
export function MemberBalances({ member, balances, isBalancesError, onRecord }: MemberBalancesProps) {
  const t = useTranslations("Passbook");
  const tBucket = useTranslations("Collections.buckets");
  const tCollections = useTranslations("Collections");
  const format = useFormatter();

  const joinDate = format.dateTime(new Date(member.joinDate), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE });
  const isActive = member.status === "active";
  const ShareIcon = member.hasShareDeposit ? BadgeCheck : CircleDashed;
  const buckets = bucketsToShow(balances);

  return (
    <section className="space-y-4 rounded-2xl border border-app-border bg-app-surface p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-app-text">{member.nameBn}</h2>
            <MemberStatusBadge status={member.status} />
          </div>
          {member.nameEn && <p className="text-sm text-app-text-muted">{member.nameEn}</p>}
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-app-text-muted">
            <span className="font-mono font-medium text-app-text">{member.memberNo}</span>
            <span>{member.phone}</span>
            <span>{joinDate}</span>
          </p>
          <p className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-medium", member.hasShareDeposit ? "text-emerald-700" : "text-app-text-muted")}>
            <ShareIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {member.hasShareDeposit ? t("shareDone") : t("shareMissing")}
          </p>
        </div>
        <Button type="button" onClick={onRecord} disabled={!isActive} className="w-full gap-2 sm:w-auto">
          <CirclePlus aria-hidden="true" className="h-4 w-4" />
          {tCollections("recordTransaction")}
        </Button>
      </div>

      <div>
        <h3 className="sr-only">{t("balancesTitle")}</h3>
        {isBalancesError && <p className="text-sm text-red-600">{t("balancesError")}</p>}
        {!isBalancesError && (
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {buckets.map((bucket) => (
              <div key={bucket} className="rounded-xl bg-app-surface-muted/60 p-3">
                <dt className="text-xs font-medium text-app-text-muted">{tBucket(bucket)}</dt>
                <dd className="mt-1">
                  {balances && (
                    <Money
                      paisa={balanceOf(balances, bucket)}
                      className={cn("text-lg font-bold", bucket === "loan" ? "text-amber-700" : "text-app-text")}
                    />
                  )}
                  {!balances && <span className="block h-7 w-24 animate-pulse rounded bg-app-surface-muted" />}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
