"use client";

import { useTranslations } from "next-intl";

import { Money } from "@/components/shared/money";
import { getAriaSort, SortableHeader } from "@/components/shared/sortable-header";
import { cn } from "@/lib/cn";

import { sumByCashEffect } from "../transaction-effects";
import type { Transaction, TransactionType } from "../types";

import {
  AccountCell,
  CASH_BOOK_COLUMNS,
  DateCell,
  EffectCell,
  LEDGER_COLUMNS,
  MemberCell,
  SignedCashCell,
  TransactionNoCell,
  TypeCell,
} from "./transaction-cells";

export type TransactionListVariant = "cashBook" | "ledger";

type TransactionsTableProps = {
  variant: TransactionListVariant;
  transactions: Transaction[];
  byCode: Map<string, TransactionType>;
  sort: string;
  onSortChange: (sort: string) => void;
  isUpdating: boolean;
  onView: (transaction: Transaction) => void;
};

// Desktop: a ledger-style table. Mobile: one tappable card per entry.
export function TransactionsTable({
  variant,
  transactions,
  byCode,
  sort,
  onSortChange,
  isUpdating,
  onView,
}: TransactionsTableProps) {
  const t = useTranslations("Collections");
  const isCashBook = variant === "cashBook";
  const columns = (isCashBook ? CASH_BOOK_COLUMNS : LEDGER_COLUMNS).map((column) => {
    const label = t(`columns.${column.headerKey}`);
    return { ...column, label, sortLabel: t("sortBy", { column: label }) };
  });
  // Cash book only: In/Out totals of the rows shown (not the whole period).
  const totals = sumByCashEffect(transactions, byCode);

  return (
    <div className={cn("transition-opacity", isUpdating && "opacity-60")} aria-busy={isUpdating}>
      <div className="hidden overflow-x-auto rounded-2xl border border-app-border bg-app-surface md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-app-border bg-app-surface-muted/50 text-xs font-semibold text-app-text-muted">
            <tr>
              {columns.map(({ id, label, sortLabel, sortField, className }) => (
                <th key={id} scope="col" aria-sort={getAriaSort(sortField, sort)} className={cn("px-4 py-3 font-semibold", className)}>
                  {sortField && (
                    <SortableHeader label={label} sortLabel={sortLabel} field={sortField} sort={sort} onSortChange={onSortChange} />
                  )}
                  {!sortField && label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {transactions.map((transaction) => (
              <tr key={transaction._id} className="transition-colors hover:bg-app-surface-muted/40">
                {columns.map(({ id, className, Cell }) => (
                  <td key={id} className={cn("px-4 py-3 align-middle", className)}>
                    <Cell transaction={transaction} byCode={byCode} onView={onView} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {isCashBook && (
            <tfoot className="border-t-2 border-app-border bg-app-surface-muted/40 text-sm font-semibold">
              <tr>
                {columns.map(({ id, className }, index) => (
                  <td key={id} className={cn("px-4 py-3", className)}>
                    {index === 0 && <span className="text-app-text-muted">{t("pageTotals")}</span>}
                    {id === "in" && <Money paisa={totals.in} className="text-emerald-700" />}
                    {id === "out" && <Money paisa={totals.out} className="text-red-700" />}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {transactions.map((transaction) => (
          <li key={transaction._id}>
            <button
              type="button"
              onClick={() => onView(transaction)}
              className="w-full rounded-2xl border border-app-border bg-app-surface p-4 text-left transition-colors active:bg-app-surface-muted/60"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-sm font-medium">
                  <TypeCell transaction={transaction} byCode={byCode} onView={onView} />
                </span>
                <span className="shrink-0 text-right text-sm">
                  {isCashBook && <SignedCashCell transaction={transaction} byCode={byCode} onView={onView} />}
                  {!isCashBook && <EffectCell transaction={transaction} byCode={byCode} onView={onView} />}
                </span>
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                <DateCell transaction={transaction} byCode={byCode} onView={onView} />
                <TransactionNoCell transaction={transaction} byCode={byCode} onView={onView} />
              </span>
              <span className="mt-2 block text-sm">
                {isCashBook && <MemberCell transaction={transaction} byCode={byCode} onView={onView} />}
                {!isCashBook && <AccountCell transaction={transaction} byCode={byCode} onView={onView} />}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {isCashBook && (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-app-border bg-app-surface-muted/40 px-4 py-3 text-sm font-semibold md:hidden">
          <span className="text-app-text-muted">{t("pageTotals")}</span>
          <span className="flex flex-col items-end text-xs">
            <span>
              {t("columns.in")} <Money paisa={totals.in} className="text-sm text-emerald-700" />
            </span>
            <span>
              {t("columns.out")} <Money paisa={totals.out} className="text-sm text-red-700" />
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
