"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, Briefcase, CircleDashed, Landmark, UserRound, UsersRound } from "lucide-react";

import { ListError, ListLoading } from "@/components/shared/list-states";
import { UserAvatar } from "@/components/shared/user-avatar";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { NomineeCard } from "@/features/nominees/components/nominee-card";
import { useMyNominees } from "@/features/nominees/hooks/use-my-nominees";
import { Link } from "@/i18n/navigation";
import { formatAddress } from "@/lib/address";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { useMyMembership } from "../hooks/use-my-membership";

import { InfoSection, type InfoRow } from "./info-section";

// Society Member Profile (/member/membership): the member record the society
// keeps (GET /member/me). The System Profile (/member/profile) stays the
// place for the login account and password.
export function MembershipView() {
  const t = useTranslations("Membership");
  const format = useFormatter();
  const { data: member, error, isPending, isFetching, refetch } = useMyMembership();
  const nominees = useMyNominees();

  const notProvided = t("notProvided");
  const day = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE }) : "";
  const row = (key: string, value: string | undefined, mono = false): InfoRow => ({
    key,
    label: t(`fields.${key}`),
    value: value || notProvided,
    isEmpty: !value,
    mono,
  });

  const isNotLinked = error?.status === 404;
  const retry = () => void refetch();

  const relation = member?.guardianRelation ? t(`relation.${member.guardianRelation}`) : "";
  const guardian = member?.guardianName ? [member.guardianName, relation && `(${relation})`].filter(Boolean).join(" ") : "";
  const ShareIcon = member?.hasShareDeposit ? BadgeCheck : CircleDashed;

  const memberRows: InfoRow[] = member
    ? [
        row("nameBn", member.nameBn),
        row("nameEn", member.nameEn),
        row("guardian", guardian),
        row("dob", day(member.dob)),
        row("phone", member.phone),
        row("nid", member.nid, true),
      ]
    : [];

  const societyRows: InfoRow[] = member
    ? [
        row("memberNo", member.memberNo, true),
        { key: "status", label: t("fields.status"), value: <MemberStatusBadge status={member.status} /> },
        row("joinDate", day(member.joinDate)),
        ...(member.status === "exited" ? [row("exitDate", day(member.exitDate))] : []),
        row("admissionFormNo", member.admissionFormNo, true),
        {
          key: "share",
          label: t("fields.share"),
          value: (
            <span className="inline-flex items-center gap-1.5">
              <ShareIcon aria-hidden="true" className="h-4 w-4" />
              {member.hasShareDeposit ? t("shareDone") : t("shareMissing")}
            </span>
          ),
        },
      ]
    : [];

  const businessRows: InfoRow[] = member
    ? [
        row("businessName", member.businessName),
        row("businessType", member.businessType),
        row("marketOrRoad", member.marketOrRoad),
        row("presentAddress", formatAddress(member.presentAddress)),
        row("permanentAddress", formatAddress(member.permanentAddress)),
      ]
    : [];
  const nomineeList = nominees.data ?? [];
  const retryNominees = () => void nominees.refetch();

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <header className="flex flex-col gap-3 motion-safe:animate-fade-in-up sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-app-primary">{t("eyebrow")}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">{t("title")}</h1>
          <p className="mt-1 text-sm text-app-text-muted">{t("subtitle")}</p>
        </div>
        <Link href="/member/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-app-primary hover:underline">
          {t("systemProfileLink")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>

      {isPending && <ListLoading rows={3} />}
      {isNotLinked && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t("notLinked")}</p>}
      {error && !isNotLinked && <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={isFetching} />}

      {member && (
        <section className="flex items-center gap-4 rounded-2xl border border-app-border bg-linear-to-br from-app-primary/10 via-app-surface to-app-surface p-5 motion-safe:animate-fade-in-up sm:p-6">
          <span className="rounded-full bg-app-surface ring-4 ring-app-surface">
            <UserAvatar name={member.nameEn || member.nameBn} size="lg" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-app-text">{member.nameBn}</h2>
            {member.nameEn && <p className="truncate text-sm text-app-text-muted">{member.nameEn}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-medium text-app-text">{member.memberNo}</span>
              <MemberStatusBadge status={member.status} />
            </div>
          </div>
        </section>
      )}

      {member && (
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-2 xl:items-start">
          <InfoSection id="membership-member" icon={UserRound} title={t("memberInfo")} hint={t("memberInfoHint")} rows={memberRows} />
          <InfoSection id="membership-society" icon={Landmark} title={t("societyInfo")} rows={societyRows} />
          <InfoSection id="membership-business" icon={Briefcase} title={t("businessInfo")} rows={businessRows} />
          {/* GET /nominee/my-nominees: read only. Changes go through the society office. */}
          <InfoSection id="membership-nominee" icon={UsersRound} title={t("nominee.title")} hint={t("nominee.hint")} rows={[]}>
            {nominees.isPending && <div aria-busy="true" className="h-24 animate-pulse rounded-2xl bg-app-surface-muted" />}
            {nominees.isError && (
              <ListError title={t("nominee.error")} retryLabel={t("retry")} onRetry={retryNominees} isRetrying={nominees.isFetching} />
            )}
            {nominees.data && nomineeList.length === 0 && <p className="text-sm text-app-text-muted">{t("nominee.empty")}</p>}
            {nomineeList.length > 0 && (
              <div className="space-y-3">
                {nomineeList.map((nominee, index) => (
                  <NomineeCard key={nominee._id} nominee={nominee} index={index} />
                ))}
              </div>
            )}
          </InfoSection>
        </div>
      )}
    </div>
  );
}
