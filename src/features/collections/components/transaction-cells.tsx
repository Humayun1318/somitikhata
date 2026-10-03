"use client";

import type { ComponentType } from "react";
import { Eye } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { Money } from "@/components/shared/money";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { cashEffectOf, isReversalEntry, memberEffectsOf, typeName, typeOf } from "../transaction-effects";
import type { Transaction, TransactionType } from "../types";

export type CellProps = {
  transaction: Transaction;
  byCode: Map<string, TransactionType>;
  onView: (transaction: Transaction) => void;
};

export type TransactionColumn = {
  id: string;
  /** Key under "Collections.columns". */
  headerKey: string;
  /** Set only for fields the backend can sort by. */
  sortField?: "transactionDate" | "transactionNo" | "amount";
  className?: string;
  Cell: ComponentType<CellProps>;
};

// ── Cells ──────────────────────────────────────────────

// Transaction dates are day-only, stored as Dhaka midnight.
export function DateCell({ transaction }: CellProps) {
  const format = useFormatter();
  const date = format.dateTime(new Date(transaction.transactionDate), {
    dateStyle: "medium",
    timeZone: DHAKA_TIME_ZONE,
  });
  return <span className="whitespace-nowrap text-app-text">{date}</span>;
}

export function TransactionNoCell({ transaction }: CellProps) {
  return <span className="whitespace-nowrap font-mono text-xs font-medium text-app-text">{transaction.transactionNo}</span>;
}

export function TypeCell({ transaction, byCode }: CellProps) {
  const t = useTranslations("Collections");
  const locale = useLocale();
  const isReversal = isReversalEntry(transaction, byCode);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className="text-app-text">{typeName(transaction.transactionType, locale)}</span>
      {isReversal && (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          {t("reversalBadge")}
        </span>
      )}
    </span>
  );
}

// Samiti entry: which ledger head it posts to.
export function HeadCell({ transaction }: CellProps) {
  const t = useTranslations("LedgerHeads.kinds");
  const locale = useLocale();
  if (!transaction.head) return <span className="text-app-text-muted">—</span>;
  return (
    <div className="min-w-0">
      <p className="truncate text-app-text">{typeName(transaction.head, locale)}</p>
      <p className="text-xs text-app-text-muted">{t(transaction.head.kind)}</p>
    </div>
  );
}

// Cash book "who" column: the member, or for a samiti entry its head.
export function MemberCell(props: CellProps) {
  const { transaction } = props;
  if (!transaction.member && transaction.head) return <HeadCell {...props} />;
  if (!transaction.member) return <span className="text-app-text-muted">—</span>;
  return (
    <div className="min-w-0">
      <p className="truncate text-app-text">{transaction.member.nameBn}</p>
      <p className="font-mono text-xs text-app-text-muted">{transaction.member.memberNo}</p>
    </div>
  );
}

export function AccountCell({ transaction }: CellProps) {
  return <span className="text-app-text">{transaction.cashAccount?.name ?? "—"}</span>;
}

export function VoucherCell({ transaction }: CellProps) {
  return <span className="font-mono text-xs text-app-text-muted">{transaction.voucherNo || "—"}</span>;
}

function CashAmountCell({ transaction, byCode, side }: CellProps & { side: "in" | "out" }) {
  if (cashEffectOf(transaction, byCode) !== side) return <span className="text-app-text-muted/50">—</span>;
  return (
    <Money
      paisa={transaction.amount}
      className={cn("font-semibold", side === "in" ? "text-emerald-700" : "text-red-700")}
    />
  );
}

export const InCell = (props: CellProps) => <CashAmountCell {...props} side="in" />;
export const OutCell = (props: CellProps) => <CashAmountCell {...props} side="out" />;

// Mobile cash book: one amount, + for cash in, − for cash out.
export function SignedCashCell({ transaction, byCode }: CellProps) {
  const effect = cashEffectOf(transaction, byCode);
  const paisa = effect === "out" ? -transaction.amount : transaction.amount;
  const color = effect === "in" ? "text-emerald-700" : effect === "out" ? "text-red-700" : "text-app-text";

  return <Money paisa={paisa} signed={effect === "in"} className={cn("font-semibold", color)} />;
}

// Passbook: which member balance moved, and how much (+ / −). For a samiti
// entry: the ledger head and which way it moved.
export function EffectCell({ transaction, byCode }: CellProps) {
  const t = useTranslations("Collections.buckets");
  const locale = useLocale();
  const effects = memberEffectsOf(transaction, byCode);
  const headEffect = typeOf(transaction, byCode)?.headEffect;
  const headPaisa = headEffect === "minus" ? -transaction.amount : transaction.amount;

  if (effects.length === 0 && transaction.head && headEffect) {
    return (
      <span className="flex items-center gap-2">
        <span className="text-xs text-app-text-muted">{typeName(transaction.head, locale)}</span>
        <Money
          paisa={headPaisa}
          signed
          className={cn("font-semibold", headEffect === "plus" ? "text-emerald-700" : "text-red-700")}
        />
      </span>
    );
  }
  if (effects.length === 0) return <Money paisa={transaction.amount} className="text-app-text" />;

  return (
    <div className="flex flex-col items-end gap-0.5">
      {effects.map(({ bucket, sign }) => (
        <span key={`${bucket}-${sign}`} className="flex items-center gap-2">
          <span className="text-xs text-app-text-muted">{t(bucket)}</span>
          <Money
            paisa={sign === "plus" ? transaction.amount : -transaction.amount}
            signed
            className={cn("font-semibold", sign === "plus" ? "text-emerald-700" : "text-red-700")}
          />
        </span>
      ))}
    </div>
  );
}

export function ViewCell({ transaction, onView }: CellProps) {
  const t = useTranslations("Collections");
  return (
    <button
      type="button"
      onClick={() => onView(transaction)}
      aria-label={`${t("viewDetails")} ${transaction.transactionNo}`}
      title={t("viewDetails")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-primary"
    >
      <Eye aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}

// ── Columns ────────────────────────────────────────────

const date: TransactionColumn = { id: "date", headerKey: "date", sortField: "transactionDate", Cell: DateCell };
const number: TransactionColumn = { id: "no", headerKey: "transactionNo", sortField: "transactionNo", Cell: TransactionNoCell };
const type: TransactionColumn = { id: "type", headerKey: "type", Cell: TypeCell };
const voucher: TransactionColumn = { id: "voucher", headerKey: "voucher", className: "hidden xl:table-cell", Cell: VoucherCell };
const view: TransactionColumn = { id: "view", headerKey: "actions", className: "w-px text-right", Cell: ViewCell };

export const CASH_BOOK_COLUMNS: TransactionColumn[] = [
  date,
  number,
  type,
  { id: "member", headerKey: "member", Cell: MemberCell },
  voucher,
  { id: "in", headerKey: "in", sortField: "amount", className: "text-right", Cell: InCell },
  { id: "out", headerKey: "out", className: "text-right", Cell: OutCell },
  view,
];

// Samiti entries: the head instead of a member, with the account it moved through.
export const SOCIETY_COLUMNS: TransactionColumn[] = [
  date,
  number,
  type,
  { id: "head", headerKey: "head", Cell: HeadCell },
  { id: "account", headerKey: "account", className: "hidden lg:table-cell", Cell: AccountCell },
  voucher,
  { id: "in", headerKey: "in", sortField: "amount", className: "text-right", Cell: InCell },
  { id: "out", headerKey: "out", className: "text-right", Cell: OutCell },
  view,
];

export const LEDGER_COLUMNS: TransactionColumn[] = [
  date,
  number,
  type,
  { id: "account", headerKey: "account", className: "hidden lg:table-cell", Cell: AccountCell },
  voucher,
  { id: "effect", headerKey: "effect", sortField: "amount", className: "text-right", Cell: EffectCell },
  view,
];
