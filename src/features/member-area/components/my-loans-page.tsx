"use client";

import { useFormatter, useTranslations } from "next-intl";
import { HandCoins } from "lucide-react";

import { ListEmpty, QueryState } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { LoanStatusBadge } from "@/features/loans/components/loan-status-badge";
import { useMyLoans, useMyOverview } from "@/features/overview/hooks/use-overview";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

// The member's loans (GET /loans/my-loans), newest first, with the open
// loan's next installment from the member overview.
export function MyLoansPage() {
  const t = useTranslations("MemberArea");
  const format = useFormatter();
  const loans = useMyLoans();
  const overview = useMyOverview();
  const openLoan = overview.data?.loan ?? null;

  const formatDay = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }) : "—";

  return (
    <div className="space-y-6">
      <PageHeader title={t("loans.title")} subtitle={t("loans.subtitle")} />

      {openLoan?.nextInstallment && (
        <section className="rounded-2xl border border-app-primary/30 bg-app-primary/5 p-4 text-sm">
          <p className="font-semibold text-app-text">{t("loans.nextTitle", { loanNo: openLoan.loanNo })}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-app-text-muted">
            {t("loans.nextLine", {
              number: format.number(openLoan.nextInstallment.installmentNo),
              date: formatDay(openLoan.nextInstallment.dueDate),
            })}
            <Money paisa={openLoan.nextInstallment.amount} className="font-semibold text-app-text" />
          </p>
          <p className="mt-1 text-app-text-muted">{t("loans.remaining", { count: openLoan.remainingInstallments })}</p>
          {openLoan.overdueInstallments > 0 && (
            <p className="mt-1 font-medium text-red-700">{t("dashboard.overdue", { count: openLoan.overdueInstallments })}</p>
          )}
        </section>
      )}

      <QueryState query={loans} errorTitle={t("loans.error")} retryLabel={t("retry")}>
        {(data) =>
          data.length === 0 ? (
            <ListEmpty icon={HandCoins} title={t("loans.emptyTitle")} body={t("loans.emptyBody")} />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {data.map((loan) => (
                <li key={loan._id} className="space-y-3 rounded-2xl border border-app-border bg-app-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-app-text">{loan.loanNo}</span>
                    <LoanStatusBadge status={loan.status} />
                  </div>
                  <Money paisa={loan.principal} className="text-2xl font-semibold text-app-text" />
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-app-text-muted">{t("loans.terms")}</dt>
                    <dd className="text-right">
                      {t("loans.termsValue", {
                        rate: format.number(loan.interestRatePercent),
                        months: format.number(loan.tenureMonths),
                      })}
                    </dd>
                    <dt className="text-app-text-muted">{t("loans.applied")}</dt>
                    <dd className="text-right">{formatDay(loan.appliedAt)}</dd>
                    {loan.disbursedAt && (
                      <>
                        <dt className="text-app-text-muted">{t("loans.disbursed")}</dt>
                        <dd className="text-right">{formatDay(loan.disbursedAt)}</dd>
                      </>
                    )}
                    {loan.closedAt && (
                      <>
                        <dt className="text-app-text-muted">{t("loans.closed")}</dt>
                        <dd className="text-right">{formatDay(loan.closedAt)}</dd>
                      </>
                    )}
                  </dl>
                  {loan.decisionNote && <p className="rounded-xl bg-app-surface-muted px-3 py-2 text-sm text-app-text-muted">{loan.decisionNote}</p>}
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </div>
  );
}
