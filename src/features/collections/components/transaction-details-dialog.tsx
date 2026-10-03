"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, CircleCheck, Info, Lock, RotateCcw, Undo2 } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { Spinner } from "@/components/ui/spinner";
import { useSetting } from "@/features/settings/hooks/use-settings";
import { DHAKA_TIME_ZONE, toDhakaDateString } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { useCashAccounts, useReversalOf, type TransactionTypeCatalog } from "../hooks/use-collection-queries";
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
  const lock = useSetting(open ? "backdate_lock_until" : "");
  const accounts = useCashAccounts();
  const empty = "—";

  const type = typeOf(transaction, catalog.byCode);
  const cashEffect = cashEffectOf(transaction, catalog.byCode);
  const isReversal = isReversalEntry(transaction, catalog.byCode);
  const reversedBy = reversal.data;
  // Loan rows are corrected from the loan, and a closed year's rows never
  // change (backend rules); the button only shows when the reversal can work.
  const isLoanEntry = type?.typeGroup === "loan";
  const lockDay = lock.data?.value ? toDhakaDateString(lock.data.value) : "";
  const isClosedYear = !!lockDay && toDhakaDateString(transaction.transactionDate) <= lockDay;
  const isLockKnown = !lock.isPending;
  const canReverse =
    !isReversal &&
    !!type?.reversalTypeCode &&
    !isLoanEntry &&
    !isClosedYear &&
    isLockKnown &&
    reversal.isSuccess &&
    !reversedBy;
  const showNotReversible = !isReversal && !!type && !type.reversalTypeCode;
  const showLoanNote = !isReversal && isLoanEntry;
  const showClosedYearNote = !isReversal && !reversedBy && isClosedYear;
  const linked = transaction.linkedTransaction;
  const linkedAccount = linked?.cashAccount
    ? (accounts.data ?? []).find((account) => account._id === linked.cashAccount)?.name
    : undefined;
  const headName = transaction.head ? typeName(transaction.head, locale) : "";

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
    // A samiti entry has a head instead of a member; a transfer has neither.
    ...(transaction.head ? [{ key: "head", label: t("fields.head"), value: headName }] : []),
    ...(transaction.member || (!transaction.head && !linked)
      ? [{ key: "member", label: t("fields.member"), value: member }]
      : []),
    { key: "account", label: t("fields.account"), value: transaction.cashAccount?.name ?? empty },
    { key: "voucherNo", label: t("fields.voucherNo"), value: transaction.voucherNo || empty, mono: true },
    { key: "recordedBy", label: t("fields.recordedBy"), value: transaction.recordedBy?.name ?? empty },
    { key: "recordedAt", label: t("fields.recordedAt"), value: moment(transaction.createdAt) },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      closeLabel={t("close")}
      size="lg"
      footer={
        <DialogActions
          cancelLabel={t("close")}
          onCancel={onClose}
          actionLabel={canReverse ? t("reverse") : undefined}
          actionIcon={RotateCcw}
          onAction={onReverse}
          tone="danger"
        />
      }
    >
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
      {linked && (
        <p className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <ArrowLeftRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {linkedAccount
            ? t("linkedWithAccount", { transactionNo: linked.transactionNo, account: linkedAccount })
            : t("linked", { transactionNo: linked.transactionNo })}
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
        {(transaction.member || transaction.head) && (
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
      {showLoanNote && (
        <p className="flex items-center gap-2 text-xs text-app-text-muted">
          <Info aria-hidden="true" className="h-3.5 w-3.5" />
          {t("loanNotReversible")}
        </p>
      )}
      {showClosedYearNote && (
        <p className="flex items-start gap-2 text-xs text-app-text-muted">
          <Lock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("closedYear", { date: day(lock.data?.value ?? transaction.transactionDate) })}
        </p>
      )}
      {showNotReversible && (
        <p className="flex items-center gap-2 text-xs text-app-text-muted">
          <Info aria-hidden="true" className="h-3.5 w-3.5" />
          {t("notReversible")}
        </p>
      )}
    </Dialog>
  );
}
