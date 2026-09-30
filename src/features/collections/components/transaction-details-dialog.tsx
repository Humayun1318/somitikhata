"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { CircleCheck, Info, RotateCcw, Undo2 } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { useReversalOf, type TransactionTypeCatalog } from "../hooks/use-collection-queries";
import { cashEffectOf, isReversalEntry, typeOf, typeName } from "../transaction-effects";
import type { Transaction } from "../types";

import { EffectCell } from "./transaction-cells";

type TransactionDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction;
  catalog: TransactionTypeCatalog;
  onReverse: () => void;
};

type DetailRow = { key: string; label: string; value: string; mono?: boolean };

// Read-only view of one entry, built from the list row. The only extra request
// checks whether a reversal entry already points at it.
export function TransactionDetailsDialog({ open, onClose, transaction, catalog, onReverse }: TransactionDetailsDialogProps) {
  const t = useTranslations("TransactionDetails");
  const format = useFormatter();
  const locale = useLocale();
  const reversal = useReversalOf(open ? transaction : null);
  const empty = "—";

  const type = typeOf(transaction, catalog.byCode);
  const cashEffect = cashEffectOf(transaction, catalog.byCode);
  const isReversal = isReversalEntry(transaction, catalog.byCode);
  const reversedBy = reversal.data;
  // The backend refuses anything else, so the button only shows when it can work.
  const canReverse = !isReversal && !!type?.reversalTypeCode && reversal.isSuccess && !reversedBy;
  const showNotReversible = !isReversal && !!type && !type.reversalTypeCode;

  const day = (value: string) => format.dateTime(new Date(value), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE });
  const moment = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short", timeZone: DHAKA_TIME_ZONE }) : empty;

  const cashLabel = cashEffect === "in" ? t("cashIn") : cashEffect === "out" ? t("cashOut") : t("noCash");
  const signedAmount = cashEffect === "out" ? -transaction.amount : transaction.amount;
  const amountColor = cashEffect === "in" ? "text-emerald-700" : cashEffect === "out" ? "text-red-700" : "text-app-text";

  const member = transaction.member ? `${transaction.member.nameBn} (${transaction.member.memberNo})` : empty;
  const rows: DetailRow[] = [
    { key: "type", label: t("fields.type"), value: typeName(transaction.transactionType, locale) },
    { key: "date", label: t("fields.date"), value: day(transaction.transactionDate) },
    { key: "member", label: t("fields.member"), value: member },
    { key: "account", label: t("fields.account"), value: transaction.cashAccount?.name ?? empty },
    { key: "voucherNo", label: t("fields.voucherNo"), value: transaction.voucherNo || empty, mono: true },
    { key: "recordedBy", label: t("fields.recordedBy"), value: transaction.recordedBy?.name ?? empty },
    { key: "recordedAt", label: t("fields.recordedAt"), value: moment(transaction.createdAt) },
  ];

  return (
    <Dialog open={open} onClose={onClose} title={t("title")} closeLabel={t("close")} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-app-surface-muted/60 p-4">
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold text-app-text">{transaction.transactionNo}</p>
            <p className="mt-0.5 text-xs text-app-text-muted">{cashLabel}</p>
          </div>
          <Money paisa={signedAmount} signed={cashEffect === "in"} className={cn("text-2xl font-bold", amountColor)} />
        </div>

        {transaction.reversalOf && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Undo2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {t("reversalOf", { transactionNo: transaction.reversalOf.transactionNo })}
          </p>
        )}
        {reversedBy && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <CircleCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {t("reversedBy", { transactionNo: reversedBy.transactionNo, date: day(reversedBy.transactionDate) })}
          </p>
        )}

        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {rows.map(({ key, label, value, mono }) => (
            <div key={key} className="min-w-0 border-b border-app-border pb-3">
              <dt className="text-xs font-medium text-app-text-muted">{label}</dt>
              <dd className={cn("mt-1 break-words text-sm", value === empty ? "text-app-text-muted" : "text-app-text", mono && "font-mono")}>
                {value}
              </dd>
            </div>
          ))}
          {transaction.member && (
            <div className="min-w-0 border-b border-app-border pb-3">
              <dt className="text-xs font-medium text-app-text-muted">{t("fields.effect")}</dt>
              <dd className="mt-1 flex text-sm">
                <EffectCell transaction={transaction} byCode={catalog.byCode} onView={onClose} />
              </dd>
            </div>
          )}
          <div className="min-w-0 border-b border-app-border pb-3 sm:col-span-2">
            <dt className="text-xs font-medium text-app-text-muted">{t("fields.description")}</dt>
            <dd className={cn("mt-1 whitespace-pre-line break-words text-sm", transaction.description ? "text-app-text" : "text-app-text-muted")}>
              {transaction.description || empty}
            </dd>
          </div>
        </dl>

        {reversal.isFetching && (
          <p className="flex items-center gap-2 text-xs text-app-text-muted">
            <Spinner className="h-3 w-3" />
            {t("checkingReversal")}
          </p>
        )}
        {showNotReversible && (
          <p className="flex items-center gap-2 text-xs text-app-text-muted">
            <Info aria-hidden="true" className="h-3.5 w-3.5" />
            {t("notReversible")}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            {t("close")}
          </Button>
          {canReverse && (
            <Button type="button" variant="outline" onClick={onReverse} className="w-full gap-2 border-red-200 text-red-700 hover:bg-red-50 sm:w-auto">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              {t("reverse")}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
