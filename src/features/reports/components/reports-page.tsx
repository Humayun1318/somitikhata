"use client";

import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { BadgePercent, Printer } from "lucide-react";

import { ListEmpty, QueryState } from "@/components/shared/list-states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectMenu } from "@/components/ui/select-menu";
import { useCashAccounts } from "@/features/collections/hooks/use-collection-queries";
import { getYearEndError } from "@/features/year-end/year-end-errors";
import { usePathname, useRouter } from "@/i18n/navigation";
import { DHAKA_TIME_ZONE, toDhakaDateString } from "@/lib/dhaka-date";
import { fiscalYearLabel, fiscalYearRange, recentFiscalYears } from "@/lib/fiscal-year";

import {
  useBalanceSheet,
  useDividendReport,
  useIncomeExpenditure,
  useReceiptsPayments,
  useTrialBalance,
} from "../hooks/use-reports";
import { REPORT_KINDS, type ReportKind } from "../types";

import { ReportSheet } from "./report-parts";
import {
  BalanceSheetView,
  DividendView,
  IncomeExpenditureView,
  ReceiptsPaymentsView,
  TrialBalanceView,
} from "./report-views";

const isReportKind = (value: string): value is ReportKind => REPORT_KINDS.includes(value as ReportKind);

// The samiti's year-end papers, worked out by the backend from the books.
// Pick a report and a fiscal year (kept in the URL), read it, print it.
export function ReportsPage() {
  const t = useTranslations("Reports");
  const tErrors = useTranslations("YearEndErrors");
  const tKind = useTranslations("YearEnd.kinds");
  const tCollections = useTranslations("CollectionErrors");
  const locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = recentFiscalYears(6);
  const reportParam = searchParams.get("report") ?? "";
  const report: ReportKind = isReportKind(reportParam) ? reportParam : "receipts-payments";
  const yearParam = searchParams.get("year") ?? "";
  const fiscalYear = years.includes(yearParam) ? yearParam : fiscalYearLabel();
  const account = searchParams.get("account") ?? "";

  // A running year is shown up to today.
  const today = toDhakaDateString();
  const yearRange = fiscalYearRange(fiscalYear);
  const range = { from: yearRange.from, to: yearRange.to < today ? yearRange.to : today };

  const receiptsPayments = useReceiptsPayments(range, account, report === "receipts-payments");
  const trialBalance = useTrialBalance(range, report === "trial-balance");
  const incomeExpenditure = useIncomeExpenditure(fiscalYear, report === "income-expenditure");
  const balanceSheet = useBalanceSheet(range.to, report === "balance-sheet");
  const dividend = useDividendReport(fiscalYear, report === "dividend");
  const accounts = useCashAccounts();

  const update = (changes: Record<string, string>) => {
    const query = new URLSearchParams({ report, year: fiscalYear, ...(account && { account }), ...changes });
    for (const [key, value] of [...query.entries()]) if (!value) query.delete(key);
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  };

  const formatDay = (day: string) => format.dateTime(new Date(`${day}T00:00:00+06:00`), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE });
  const period = report === "balance-sheet" ? t("asOf", { date: formatDay(range.to) }) : t("period", { from: formatDay(range.from), to: formatDay(range.to) });
  const errorTitle = (error: unknown) =>
    getYearEndError(error, { t: tErrors, tKind, tCollections, locale }).formError ?? t("error");

  const reportOptions = REPORT_KINDS.map((kind) => ({ value: kind, label: t(`kinds.${kind}`) }));
  const yearOptions = years.map((year) => ({ value: year, label: t("yearOption", { year }) }));
  const accountOptions = [
    { value: "", label: t("allAccounts") },
    ...(accounts.data ?? []).map((item) => ({ value: item._id, label: item.name })),
  ];
  const sheetTitle = t(`kinds.${report}`);
  const print = () => window.print();

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <PageHeader title={t("title")} subtitle={t("subtitle")}>
          <Button type="button" variant="outline" onClick={print} className="w-full gap-2 sm:w-auto">
            <Printer aria-hidden="true" className="h-4 w-4" />
            {t("print")}
          </Button>
        </PageHeader>
      </div>

      <div className="space-y-3 print:hidden">
        <SegmentedControl value={report} onChange={(value) => update({ report: value })} options={reportOptions} aria-label={t("kindLabel")} />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="sm:w-56">
            <SelectMenu value={fiscalYear} onChange={(value) => update({ year: value })} options={yearOptions} aria-label={t("yearLabel")} searchable={false} />
          </div>
          {report === "receipts-payments" && (
            <div className="sm:w-64">
              <SelectMenu
                value={account}
                onChange={(value) => update({ account: value })}
                options={accountOptions}
                aria-label={t("accountLabel")}
                highlighted={!!account}
                searchable={false}
              />
            </div>
          )}
        </div>
        <p className="text-xs text-app-text-muted">{t(`hints.${report}`)}</p>
      </div>

      <ReportSheet title={sheetTitle} period={period}>
        {report === "receipts-payments" && (
          <QueryState query={receiptsPayments} errorTitle={errorTitle(receiptsPayments.error)} retryLabel={t("retry")}>
            {(data) => <ReceiptsPaymentsView report={data} />}
          </QueryState>
        )}
        {report === "trial-balance" && (
          <QueryState query={trialBalance} errorTitle={errorTitle(trialBalance.error)} retryLabel={t("retry")}>
            {(data) => <TrialBalanceView report={data} />}
          </QueryState>
        )}
        {report === "income-expenditure" && (
          <QueryState query={incomeExpenditure} errorTitle={errorTitle(incomeExpenditure.error)} retryLabel={t("retry")}>
            {(data) => <IncomeExpenditureView report={data} />}
          </QueryState>
        )}
        {report === "balance-sheet" && (
          <QueryState query={balanceSheet} errorTitle={errorTitle(balanceSheet.error)} retryLabel={t("retry")}>
            {(data) => <BalanceSheetView report={data} />}
          </QueryState>
        )}
        {report === "dividend" && dividend.error?.status === 404 && (
          <ListEmpty icon={BadgePercent} title={t("dividendNotRun", { fiscalYear })} body={t("dividendNotRunBody")} />
        )}
        {report === "dividend" && dividend.error?.status !== 404 && (
          <QueryState query={dividend} errorTitle={errorTitle(dividend.error)} retryLabel={t("retry")}>
            {(data) => <DividendView report={data} />}
          </QueryState>
        )}
      </ReportSheet>
    </div>
  );
}
