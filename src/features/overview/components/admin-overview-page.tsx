"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import {
  AlarmClock,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  HandCoins,
  Landmark,
  PiggyBank,
  ReceiptText,
  Scale,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { QueryState } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SelectMenu } from "@/components/ui/select-menu";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { fiscalYearLabel, recentFiscalYears } from "@/lib/fiscal-year";

import { useAdminOverview } from "../hooks/use-overview";
import type { AdminOverview } from "../types";

// The admin home: what needs doing now, then the samiti's numbers for one
// fiscal year (all from GET /dashboard/overview, the same figures as the reports).
export function AdminOverviewPage() {
  const t = useTranslations("AdminOverview");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = recentFiscalYears(6);
  const requested = searchParams.get("year") ?? "";
  const fiscalYear = years.includes(requested) ? requested : fiscalYearLabel();
  const overview = useAdminOverview(fiscalYear);

  const yearOptions = years.map((year) => ({ value: year, label: t("yearOption", { year }) }));
  const changeYear = (year: string) => router.replace(`${pathname}?year=${year}`, { scroll: false });
  const asOf = overview.data
    ? format.dateTime(new Date(overview.data.asOf), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE })
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={asOf ? t("subtitle", { date: asOf }) : t("subtitleLoading")}>
        <div className="w-full sm:w-56">
          <SelectMenu value={fiscalYear} onChange={changeYear} options={yearOptions} aria-label={t("yearLabel")} searchable={false} />
        </div>
      </PageHeader>

      <QueryState
        query={overview}
        errorTitle={t("error")}
        retryLabel={t("retry")}
        loading={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-app-surface-muted" />
            ))}
          </div>
        }
      >
        {(data) => <OverviewBody data={data} />}
      </QueryState>
    </div>
  );
}

function OverviewBody({ data }: { data: AdminOverview }) {
  const t = useTranslations("AdminOverview");
  const format = useFormatter();
  const { flows, incomeExpense, members, memberBalances, cash, loans } = data;

  return (
    <div className="space-y-6">
      <PendingActions data={data} />

      <Section title={t("sections.cash")}>
        <StatGrid>
          <StatCard icon={Wallet} label={t("cash.total")} value={<Money paisa={cash.total} />} />
          <StatCard icon={Banknote} label={t("cash.inHand")} value={<Money paisa={cash.cashInHand} />} />
          <StatCard icon={Landmark} label={t("cash.bank")} value={<Money paisa={cash.bank} />} />
          <StatCard
            icon={TrendingUp}
            tone={incomeExpense.netProfit < 0 ? "negative" : "positive"}
            label={t("cash.netProfit")}
            value={<Money paisa={incomeExpense.netProfit} />}
            hint={t("cash.netProfitHint")}
          />
        </StatGrid>
      </Section>

      <Section title={t("sections.members")} href="/admin/members" linkLabel={t("viewAll")}>
        <StatGrid>
          <StatCard
            icon={Users}
            label={t("members.total")}
            value={format.number(members.total)}
            hint={t("members.byStatus", {
              active: format.number(members.byStatus.active ?? 0),
              inactive: format.number((members.byStatus.inactive ?? 0) + (members.byStatus.suspended ?? 0)),
            })}
          />
          <StatCard icon={UserCheck} label={t("members.joined")} value={format.number(members.joinedThisYear)} />
          <StatCard icon={PiggyBank} label={t("balances.amanot")} value={<Money paisa={memberBalances.amanot} />} />
          <StatCard
            icon={Scale}
            label={t("balances.shareAndStayi")}
            value={<Money paisa={memberBalances.share + memberBalances.stayi} />}
            hint={
              <>
                {t("balances.share")} <Money paisa={memberBalances.share} /> · {t("balances.stayi")} <Money paisa={memberBalances.stayi} />
              </>
            }
          />
        </StatGrid>
      </Section>

      <Section title={t("sections.flows")}>
        <StatGrid>
          <StatCard icon={ArrowDownLeft} tone="positive" label={t("flows.amanotDeposits")} value={<Money paisa={flows.amanotDeposits} />} />
          <StatCard icon={ArrowUpRight} tone="negative" label={t("flows.amanotWithdrawals")} value={<Money paisa={flows.amanotWithdrawals} />} />
          <StatCard
            icon={ArrowDownLeft}
            label={t("flows.otherDeposits")}
            value={<Money paisa={flows.shareDeposits + flows.stayiDeposits} />}
            hint={t("flows.otherDepositsHint")}
          />
          <StatCard
            icon={ReceiptText}
            label={t("flows.yearEnd")}
            value={<Money paisa={flows.serviceCharge} />}
            hint={
              <>
                {t("flows.dividend")} <Money paisa={flows.dividend} />
              </>
            }
          />
        </StatGrid>
      </Section>

      <Section title={t("sections.loans")} href="/admin/loans" linkLabel={t("viewAll")}>
        <StatGrid>
          <StatCard icon={HandCoins} label={t("loans.outstanding")} value={<Money paisa={loans.outstanding} />} hint={t("loans.active", { count: loans.active })} />
          <StatCard icon={ArrowUpRight} label={t("loans.disbursed")} value={<Money paisa={flows.loanDisbursed} />} />
          <StatCard
            icon={ArrowDownLeft}
            label={t("loans.repaid")}
            value={<Money paisa={flows.loanPrincipalRepaid} />}
            hint={
              <>
                {t("loans.interest")} <Money paisa={flows.loanInterest} />
              </>
            }
          />
          <StatCard
            icon={AlarmClock}
            tone={loans.overdueInstallments > 0 ? "warning" : "default"}
            label={t("loans.overdue")}
            value={<Money paisa={loans.overdueAmount} />}
            hint={t("loans.overdueCount", { count: loans.overdueInstallments })}
          />
        </StatGrid>
      </Section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title={t("sections.monthly")}>
          <MonthlyTable data={data} />
        </Section>
        <Section title={t("sections.incomeExpense")} href="/admin/reports?report=income-expenditure" linkLabel={t("openReport")}>
          <dl className="divide-y divide-app-border rounded-2xl border border-app-border bg-app-surface text-sm">
            {[
              { key: "income", label: t("incomeExpense.income"), value: incomeExpense.totalIncome },
              { key: "expense", label: t("incomeExpense.expense"), value: incomeExpense.totalExpense },
              { key: "profit", label: t("incomeExpense.netProfit"), value: incomeExpense.netProfit, strong: true },
            ].map((row) => (
              <div key={row.key} className="flex justify-between gap-3 px-4 py-3">
                <dt className={cn("text-app-text-muted", row.strong && "font-semibold text-app-text")}>{row.label}</dt>
                <dd className={cn(row.strong && "font-semibold")}>
                  <Money paisa={row.value} />
                </dd>
              </div>
            ))}
            {data.funds.map((fund) => (
              <div key={fund.headId} className="flex justify-between gap-3 px-4 py-3">
                <dt className="text-app-text-muted">{fund.nameBn}</dt>
                <dd>
                  <Money paisa={fund.balance} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, href, linkLabel, children }: { title: string; href?: string; linkLabel?: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-app-text">{title}</h2>
        {href && linkLabel && (
          <Link href={href} className="inline-flex items-center gap-0.5 text-sm font-medium text-app-primary hover:underline">
            {linkLabel}
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

type Action = { key: string; icon: LucideIcon; label: string; href: string };

// Work waiting for an admin, each a link to the page where it is done.
function PendingActions({ data }: { data: AdminOverview }) {
  const t = useTranslations("AdminOverview.pending");
  const tKind = useTranslations("YearEnd.kinds");
  const { pendingActions } = data;

  const actions: Action[] = [
    ...(pendingActions.loanApplications > 0
      ? [{ key: "applied", icon: ClipboardList, label: t("loanApplications", { count: pendingActions.loanApplications }), href: "/admin/loans?status=applied" }]
      : []),
    ...(pendingActions.loansToDisburse > 0
      ? [{ key: "approved", icon: HandCoins, label: t("loansToDisburse", { count: pendingActions.loansToDisburse }), href: "/admin/loans?status=approved" }]
      : []),
    ...(pendingActions.overdueInstallments > 0
      ? [{ key: "overdue", icon: AlarmClock, label: t("overdue", { count: pendingActions.overdueInstallments }), href: "/admin/loans?status=active" }]
      : []),
    ...(pendingActions.serviceChargeDue.members > 0
      ? [{ key: "due", icon: ReceiptText, label: t("serviceChargeDue", { count: pendingActions.serviceChargeDue.members }), href: "/admin/year-end" }]
      : []),
    ...(pendingActions.yearEnd
      ? [{
          key: "year-end",
          icon: CalendarCheck,
          label: t("yearEnd", { fiscalYear: pendingActions.yearEnd.fiscalYear, step: tKind(pendingActions.yearEnd.nextStep) }),
          href: `/admin/year-end?year=${pendingActions.yearEnd.fiscalYear}`,
        }]
      : []),
  ];

  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-4">
      <h2 className="text-base font-semibold text-app-text">{t("title")}</h2>
      {actions.length === 0 ? (
        <p className="mt-1 text-sm text-app-text-muted">{t("none")}</p>
      ) : (
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {actions.map(({ key, icon: Icon, label, href }) => (
            <li key={key}>
              <Link
                href={href}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-50"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Amanot in and out per month (a table, so every figure can be read exactly).
function MonthlyTable({ data }: { data: AdminOverview }) {
  const t = useTranslations("AdminOverview.monthly");
  const format = useFormatter();

  return (
    <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface">
      <table className="w-full text-sm">
        <thead className="bg-app-surface-muted/70 text-xs text-app-text-muted">
          <tr>
            <th scope="col" className="px-4 py-2 text-left font-medium">{t("month")}</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">{t("deposits")}</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">{t("withdrawals")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border/70">
          {data.monthly.map((row) => (
            <tr key={row.month}>
              <td className="px-4 py-2 text-app-text">
                {format.dateTime(new Date(`${row.month}-15T00:00:00+06:00`), { month: "long", year: "numeric", timeZone: DHAKA_TIME_ZONE })}
              </td>
              <td className="px-4 py-2 text-right text-emerald-700">
                <Money paisa={row.deposits} />
              </td>
              <td className="px-4 py-2 text-right text-red-700">
                <Money paisa={row.withdrawals} />
              </td>
            </tr>
          ))}
          {data.monthly.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-app-text-muted">
                {t("empty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
