"use client";

import { useFormatter, useTranslations } from "next-intl";

import { Money } from "@/components/shared/money";
import { MemberLinesTable } from "@/features/year-end/components/member-lines-table";
import { DividendFigures } from "@/features/year-end/components/run-summary";

import type {
  BalanceSheetReport,
  BalanceSheetSection,
  DividendReport,
  IncomeExpenditureReport,
  ReceiptsPaymentsReport,
  TrialBalanceReport,
} from "../types";

import { DifferenceNote, linesToRows, ReportColumn, TwoColumns } from "./report-parts";

// প্রাপ্তি ও প্রদান: opening + receipts = payments + closing.
export function ReceiptsPaymentsView({ report }: { report: ReceiptsPaymentsReport }) {
  const t = useTranslations("Reports.receiptsPayments");

  return (
    <div className="space-y-4">
      <TwoColumns>
        <ReportColumn
          title={t("receipts")}
          rows={[{ key: "opening", label: t("opening"), amount: report.opening, strong: true }, ...linesToRows(report.receipts)]}
          total={report.grandTotal}
          totalLabel={t("total")}
        />
        <ReportColumn
          title={t("payments")}
          rows={[...linesToRows(report.payments), { key: "closing", label: t("closing"), amount: report.closing, strong: true }]}
          total={report.grandTotal}
          totalLabel={t("total")}
        />
      </TwoColumns>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <Figure label={t("totalReceipts")} paisa={report.totalReceipts} />
        <Figure label={t("totalPayments")} paisa={report.totalPayments} />
        <Figure label={t("actualClosing")} paisa={report.actualClosing} />
      </dl>
      <DifferenceNote difference={report.difference} message={t("difference")} />
    </div>
  );
}

// রেওয়ামিল: every head's debit or credit, the two totals equal.
export function TrialBalanceView({ report }: { report: TrialBalanceReport }) {
  const t = useTranslations("Reports.trialBalance");
  const format = useFormatter();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-app-border">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-app-surface-muted/70 text-xs text-app-text-muted">
            <tr>
              <th scope="col" className="w-12 px-3 py-2 text-left font-medium">{t("serial")}</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">{t("head")}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t("debit")}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">{t("credit")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border/70">
            {report.rows.map((row) => (
              <tr key={row.key}>
                <td className="px-3 py-2 text-app-text-muted">{format.number(row.serial)}</td>
                <td className="px-3 py-2 text-app-text">{row.label}</td>
                <td className="px-3 py-2 text-right">{row.debit ? <Money paisa={row.debit} /> : ""}</td>
                <td className="px-3 py-2 text-right">{row.credit ? <Money paisa={row.credit} /> : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-app-border font-bold">
            <tr>
              <td className="px-3 py-2" colSpan={2}>{t("total")}</td>
              <td className="px-3 py-2 text-right"><Money paisa={report.totalDebit} /></td>
              <td className="px-3 py-2 text-right"><Money paisa={report.totalCredit} /></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <DifferenceNote difference={report.difference} message={t("difference")} />
    </div>
  );
}

// আয়-ব্যয় হিসাব: expense (with net profit) | income; then the appropriation once run.
export function IncomeExpenditureView({ report }: { report: IncomeExpenditureReport }) {
  const t = useTranslations("Reports.incomeExpenditure");
  const tRoles = useTranslations("YearEnd.roles");
  const format = useFormatter();
  const { netProfit } = report.totals;

  const expenseRows = [
    ...linesToRows(report.expense),
    ...(netProfit > 0 ? [{ key: "net-profit", label: t("netProfit"), amount: netProfit, strong: true }] : []),
  ];
  const incomeRows = [
    ...linesToRows(report.income),
    ...(netProfit < 0 ? [{ key: "net-loss", label: t("netLoss"), amount: -netProfit, strong: true }] : []),
  ];

  return (
    <div className="space-y-4">
      <TwoColumns>
        <ReportColumn title={t("expense")} rows={expenseRows} total={report.grandTotal} totalLabel={t("total")} />
        <ReportColumn title={t("income")} rows={incomeRows} total={report.grandTotal} totalLabel={t("total")} />
      </TwoColumns>

      <section className="rounded-xl border border-app-border p-3">
        <h3 className="text-sm font-semibold text-app-text">{t("appropriationTitle")}</h3>
        {report.appropriation ? (
          <ul className="mt-2 divide-y divide-app-border/70 text-sm">
            {report.appropriation.lines.map((line) => (
              <li key={line.role} className="flex justify-between gap-3 py-1.5">
                <span>
                  {line.label || tRoles(line.role)}
                  {line.percent !== null && (
                    <span className="ml-1.5 text-app-text-muted">
                      ({format.number(line.percent / 100, { style: "percent", maximumFractionDigits: 2 })})
                    </span>
                  )}
                </span>
                <Money paisa={line.amount} className="font-medium" />
              </li>
            ))}
            <li className="flex justify-between gap-3 py-1.5 font-semibold">
              <span>{t("appropriationTotal")}</span>
              <Money paisa={report.appropriation.total} />
            </li>
          </ul>
        ) : (
          <p className="mt-1 text-sm text-app-text-muted">{t("notAppropriated")}</p>
        )}
      </section>
    </div>
  );
}

// উদ্বৃত্ত পত্র: liabilities and funds | assets, each by section.
export function BalanceSheetView({ report }: { report: BalanceSheetReport }) {
  const t = useTranslations("Reports.balanceSheet");

  return (
    <div className="space-y-4">
      <TwoColumns>
        <BalanceSide title={t("liabilities")} sections={report.liabilities} total={report.totalLiabilities} totalLabel={t("total")} />
        <BalanceSide title={t("assets")} sections={report.assets} total={report.totalAssets} totalLabel={t("total")} />
      </TwoColumns>
      <DifferenceNote difference={report.difference} message={t("difference")} />
    </div>
  );
}

type BalanceSideProps = { title: string; sections: BalanceSheetSection[]; total: number; totalLabel: string };

function BalanceSide({ title, sections, total, totalLabel }: BalanceSideProps) {
  const t = useTranslations("Reports.balanceSheet");

  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-app-border">
      <h3 className="border-b border-app-border bg-app-surface-muted/70 px-3 py-2 text-sm font-semibold text-app-text">{title}</h3>
      <div className="flex-1 divide-y divide-app-border">
        {sections.map((section) => (
          <div key={section.key} className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{section.label}</p>
            <ul className="mt-1 space-y-1.5">
              {section.lines.map((line) => (
                <li key={line.key} className="text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 text-app-text">{line.label}</span>
                    <Money paisa={line.amount} className="font-medium" />
                  </div>
                  {line.previous !== undefined && (line.movements?.length ?? 0) > 0 && (
                    <ul className="mt-0.5 space-y-0.5 border-l-2 border-app-border pl-2 text-xs text-app-text-muted">
                      <li className="flex justify-between gap-3">
                        <span>{t("previous")}</span>
                        <Money paisa={line.previous} />
                      </li>
                      {line.movements?.map((movement) => (
                        <li key={movement.label} className="flex justify-between gap-3">
                          <span>{movement.label}</span>
                          <Money paisa={movement.amount} signed />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              {section.lines.length === 0 && <li className="text-sm text-app-text-muted">—</li>}
            </ul>
          </div>
        ))}
      </div>
      <p className="flex items-baseline justify-between gap-3 border-t-2 border-app-border px-3 py-2 text-sm font-bold text-app-text">
        <span>{totalLabel}</span>
        <Money paisa={total} />
      </p>
    </section>
  );
}

// The dividend run's member list (who got how much, and why).
export function DividendView({ report }: { report: DividendReport }) {
  return (
    <div className="space-y-4">
      <DividendFigures summary={report.summary} settings={report.settings} />
      <MemberLinesTable kind="dividend" lines={report.lines} />
    </div>
  );
}

function Figure({ label, paisa }: { label: string; paisa: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-xl bg-app-surface-muted/60 px-3 py-2">
      <dt className="text-app-text-muted">{label}</dt>
      <dd className="font-semibold text-app-text">
        <Money paisa={paisa} />
      </dd>
    </div>
  );
}
