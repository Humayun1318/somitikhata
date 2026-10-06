"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { BadgePercent, CalendarClock, ChevronRight, ReceiptText } from "lucide-react";

import { ListEmpty, QueryState } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { LoanStatusBadge } from "@/features/loans/components/loan-status-badge";
import { MemberStatusBadge } from "@/features/members/components/member-status-badge";
import { useMyOverview } from "@/features/overview/hooks/use-overview";
import type { MyOverview } from "@/features/overview/types";
import { Link } from "@/i18n/navigation";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { MyBalances } from "./my-balances";
import { MyTransactionRows } from "./my-transaction-rows";

// A member's home: their balances, current loan, last dividend, any service
// charge still due, and the latest entries (GET /dashboard/my-overview).
export function MemberDashboardPage() {
  const t = useTranslations("MemberArea");
  const overview = useMyOverview();
  const name = overview.data?.member.nameBn;

  return (
    <div className="space-y-6">
      <PageHeader title={name ? t("dashboard.greeting", { name }) : t("dashboard.title")} subtitle={t("dashboard.subtitle")} />
      <QueryState query={overview} errorTitle={t("error")} retryLabel={t("retry")}>
        {(data) => <DashboardBody data={data} />}
      </QueryState>
    </div>
  );
}

function DashboardBody({ data }: { data: MyOverview }) {
  const t = useTranslations("MemberArea");
  const format = useFormatter();
  const formatDay = (value: string) => format.dateTime(new Date(value), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE });

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm">
        <span className="font-mono font-semibold text-app-text">{data.member.memberNo}</span>
        <MemberStatusBadge status={data.member.status} />
        <span className="text-app-text-muted">{t("dashboard.memberSince", { date: formatDay(data.member.joinDate) })}</span>
      </section>

      <MyBalances balances={data.balances} />

      <div className="grid gap-3 lg:grid-cols-3">
        <InfoCard icon={CalendarClock} title={t("dashboard.loanTitle")} href="/member/loans" linkLabel={t("dashboard.loanLink")}>
          {data.loan ? (
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center justify-between gap-2">
                <span className="font-mono text-app-text-muted">{data.loan.loanNo}</span>
                <LoanStatusBadge status={data.loan.status} />
              </p>
              <p className="flex justify-between gap-2">
                {t("dashboard.principal")} <Money paisa={data.loan.principal} className="font-semibold" />
              </p>
              {data.loan.nextInstallment && (
                <p className="flex justify-between gap-2">
                  {t("dashboard.nextInstallment", { date: formatDay(data.loan.nextInstallment.dueDate) })}
                  <Money paisa={data.loan.nextInstallment.amount} className="font-semibold" />
                </p>
              )}
              {data.loan.overdueInstallments > 0 && (
                <p className="font-medium text-red-700">{t("dashboard.overdue", { count: data.loan.overdueInstallments })}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-app-text-muted">{t("dashboard.noLoan")}</p>
          )}
        </InfoCard>

        <InfoCard icon={BadgePercent} title={t("dashboard.dividendTitle")}>
          {data.lastDividend ? (
            <div className="space-y-1 text-sm">
              <Money paisa={data.lastDividend.amount} className="text-xl font-semibold text-emerald-700" />
              <p className="text-app-text-muted">{t("dashboard.dividendFor", { fiscalYear: data.lastDividend.fiscalYear })}</p>
            </div>
          ) : (
            <p className="text-sm text-app-text-muted">{t("dashboard.noDividend")}</p>
          )}
        </InfoCard>

        <InfoCard icon={ReceiptText} title={t("dashboard.serviceChargeTitle")}>
          {data.serviceChargeDue > 0 ? (
            <div className="space-y-1 text-sm">
              <Money paisa={data.serviceChargeDue} className="text-xl font-semibold text-red-700" />
              <p className="text-app-text-muted">{t("dashboard.serviceChargeDue")}</p>
            </div>
          ) : (
            <p className="text-sm text-app-text-muted">{t("dashboard.noServiceChargeDue")}</p>
          )}
        </InfoCard>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-app-text">{t("dashboard.recent")}</h2>
          <Link href="/member/savings" className="inline-flex items-center gap-0.5 text-sm font-medium text-app-primary hover:underline">
            {t("dashboard.allTransactions")}
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        {data.recentTransactions.length > 0 ? (
          <MyTransactionRows transactions={data.recentTransactions} />
        ) : (
          <ListEmpty icon={ReceiptText} title={t("savings.emptyTitle")} body={t("savings.emptyBody")} />
        )}
      </section>
    </div>
  );
}

type InfoCardProps = {
  icon: typeof ReceiptText;
  title: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
};

function InfoCard({ icon: Icon, title, href, linkLabel, children }: InfoCardProps) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-app-text">
        <Icon aria-hidden="true" className="h-4 w-4 text-app-primary" />
        {title}
      </h2>
      <div className="flex-1">{children}</div>
      {href && linkLabel && (
        <Link href={href} className="text-sm font-medium text-app-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </section>
  );
}
