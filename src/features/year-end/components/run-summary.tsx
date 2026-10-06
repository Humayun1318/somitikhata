"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { Money } from "@/components/shared/money";
import { cn } from "@/lib/cn";

import type {
  AppropriationLine,
  AppropriationSettings,
  AppropriationSummary,
  DividendSettings,
  DividendSummary,
  ServiceChargeSettings,
  ServiceChargeSummary,
} from "../types";

// Label + figure rows, two columns from sm up.
export function FigureList({ rows }: { rows: { key: string; label: string; value: ReactNode; strong?: boolean }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-xl bg-app-surface-muted/60 p-3 text-sm sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-baseline justify-between gap-3">
          <dt className="text-app-text-muted">{row.label}</dt>
          <dd className={cn("text-right text-app-text", row.strong && "font-semibold")}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ServiceChargeFigures({ summary, settings }: { summary: ServiceChargeSummary; settings?: ServiceChargeSettings | null }) {
  const t = useTranslations("YearEnd.figures");
  const format = useFormatter();

  return (
    <FigureList
      rows={[
        ...(settings ? [{ key: "rate", label: t("chargePerMember"), value: <Money paisa={settings.serviceChargeAmount} /> }] : []),
        { key: "members", label: t("members"), value: format.number(summary.memberCount) },
        { key: "charged", label: t("chargedMembers"), value: format.number(summary.chargedCount) },
        { key: "total", label: t("totalCharged"), value: <Money paisa={summary.totalCharged} />, strong: true },
        { key: "due", label: t("totalDue"), value: <Money paisa={summary.totalDue} className={summary.totalDue > 0 ? "text-red-700" : undefined} /> },
      ]}
    />
  );
}

export function DividendFigures({ summary, settings }: { summary: DividendSummary; settings?: DividendSettings | null }) {
  const t = useTranslations("YearEnd.figures");
  const format = useFormatter();
  const percent = (rate: number | null) =>
    rate === null ? "—" : format.number(rate, { style: "percent", maximumFractionDigits: 4 });

  return (
    <div className="space-y-3">
      <FigureList
        rows={[
          { key: "amount", label: t("distributable"), value: <Money paisa={summary.distributableAmount} />, strong: true },
          { key: "paid", label: t("totalPaid"), value: <Money paisa={summary.totalPaid} className="text-emerald-700" />, strong: true },
          { key: "unpaid", label: t("unpaid"), value: <Money paisa={summary.unpaid} /> },
          { key: "base", label: t("totalBase"), value: <Money paisa={summary.totalBase} /> },
          { key: "rate", label: t("baseRate"), value: percent(summary.baseRate) },
          { key: "largeRate", label: t("largeRate"), value: percent(summary.largeRate) },
          { key: "eligible", label: t("eligible"), value: format.number(summary.eligibleCount) },
          { key: "excluded", label: t("excluded"), value: format.number(summary.excludedCount) },
          { key: "small", label: t("smallGroup"), value: format.number(summary.smallCount) },
          { key: "smallTotal", label: t("smallTotal"), value: <Money paisa={summary.smallTotal} /> },
          { key: "capped", label: t("cappedLarge"), value: format.number(summary.cappedCount) },
        ]}
      />
      {settings && (
        <p className="text-xs text-app-text-muted">
          {t.rich("dividendRules", {
            threshold: () => <Money paisa={settings.capThreshold} />,
            cap: () => <Money paisa={settings.capAmount} />,
            max: () => <Money paisa={settings.maxAmount} />,
          })}
        </p>
      )}
    </div>
  );
}

export function IncomeExpenseFigures({ summary }: { summary: AppropriationSummary }) {
  const t = useTranslations("YearEnd.figures");

  return (
    <FigureList
      rows={[
        { key: "incomeHeads", label: t("incomeHeads"), value: <Money paisa={summary.incomeHeads} /> },
        { key: "loanInterest", label: t("loanInterest"), value: <Money paisa={summary.loanInterest} /> },
        { key: "serviceCharge", label: t("serviceCharge"), value: <Money paisa={summary.serviceCharge} /> },
        { key: "totalIncome", label: t("totalIncome"), value: <Money paisa={summary.totalIncome} />, strong: true },
        { key: "expenseHeads", label: t("expenseHeads"), value: <Money paisa={summary.expenseHeads} /> },
        { key: "depreciation", label: t("depreciation"), value: <Money paisa={summary.depreciation} /> },
        { key: "dividend", label: t("dividend"), value: <Money paisa={summary.dividend} /> },
        { key: "totalExpense", label: t("totalExpense"), value: <Money paisa={summary.totalExpense} />, strong: true },
        {
          key: "netProfit",
          label: t("netProfit"),
          value: <Money paisa={summary.netProfit} className={summary.netProfit < 0 ? "text-red-700" : "text-emerald-700"} />,
          strong: true,
        },
      ]}
    />
  );
}

type AppropriationTableProps = { lines: AppropriationLine[]; settings?: AppropriationSettings | null };

export function AppropriationTable({ lines }: AppropriationTableProps) {
  const t = useTranslations("YearEnd.figures");
  const tRoles = useTranslations("YearEnd.roles");
  const format = useFormatter();
  const total = lines.reduce((sum, line) => sum + line.amount, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-app-border">
      <table className="w-full text-sm">
        <thead className="bg-app-surface-muted text-xs text-app-text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">{t("fund")}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{t("percent")}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{t("amount")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {lines.map((line) => (
            <tr key={line.role}>
              <td className="px-3 py-2">
                <span className="block font-medium text-app-text">{tRoles(line.role)}</span>
                <span className="text-xs text-app-text-muted">{line.nameBn ?? t("noHead")}</span>
              </td>
              <td className="px-3 py-2 text-right text-app-text-muted">
                {line.percent === null ? t("rest") : format.number(line.percent / 100, { style: "percent", maximumFractionDigits: 2 })}
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                <Money paisa={line.amount} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-app-border bg-app-surface-muted/60 font-semibold">
          <tr>
            <td className="px-3 py-2" colSpan={2}>{t("total")}</td>
            <td className="px-3 py-2 text-right">
              <Money paisa={total} />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
