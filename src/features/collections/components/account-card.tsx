"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Banknote, Landmark, Lock, LockOpen, Pencil } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

import type { BankAccountType, CashAccount } from "../types";

// One colour per bank account type, so savings, FDR and current accounts are told apart at a glance
const TYPE_TONES: Record<BankAccountType, string> = {
  savings: "bg-emerald-50 text-emerald-700",
  fdr: "bg-blue-50 text-blue-700",
  current: "bg-amber-50 text-amber-800",
};

type AccountCardProps = {
  account: CashAccount;
  /** Paisa. undefined while loading. */
  balance?: number;
  isBalanceError: boolean;
  /** Super admin only: close or reopen the account. */
  onToggleStatus?: () => void;
  isToggling: boolean;
  /** Super admin only, bank accounts: edit the bank name and account type. */
  onEdit?: () => void;
};

export function AccountCard({ account, balance, isBalanceError, onToggleStatus, isToggling, onEdit }: AccountCardProps) {
  const t = useTranslations("Collections");
  const isClosed = account.status === "closed";
  const KindIcon = account.accountKind === "bank" ? Landmark : Banknote;
  const ToggleIcon = isClosed ? LockOpen : Lock;
  const toggleLabel = isClosed ? t("reopenAccount") : t("closeAccount");
  const isBalanceLoading = balance === undefined && !isBalanceError;
  const isBank = account.accountKind === "bank";
  const typeLabel = account.bankAccountType ? t(`bankType.${account.bankAccountType}`) : t("bankType.missing");
  const typeTone = account.bankAccountType ? TYPE_TONES[account.bankAccountType] : "border border-dashed border-amber-400 bg-amber-50 text-amber-800";

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border border-app-border bg-app-surface p-5",
        isClosed && "bg-app-surface-muted/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-primary/10 text-app-primary">
            <KindIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-app-text">{account.name}</h3>
            <p className="truncate text-xs text-app-text-muted">
              {t(`kind.${account.accountKind}`)}
              {account.bankName && ` · ${account.bankName}`}
            </p>
            {isBank && (
              <span className={cn("mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", typeTone)}>
                {typeLabel}
              </span>
            )}
          </div>
        </div>
        {isClosed && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {t("accountStatus.closed")}
          </span>
        )}
      </div>

      <div className="mt-5 min-h-9">
        {isBalanceLoading && <div className="h-8 w-40 animate-pulse rounded-lg bg-app-surface-muted" />}
        {isBalanceError && <p className="text-sm text-red-600">{t("balanceError")}</p>}
        {balance !== undefined && (
          <Money paisa={balance} className={cn("text-2xl font-bold", balance < 0 ? "text-red-700" : "text-app-text")} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-app-border pt-3">
        <Link
          href={`/admin/collections/cash-book?account=${account._id}`}
          className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-app-primary hover:underline"
        >
          {t("openCashBook")}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <div className="flex flex-wrap items-center gap-2">
        {onEdit && isBank && (
          <Button type="button" variant="outline" onClick={onEdit} className="min-h-9 gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs">
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
            {t("editAccount")}
          </Button>
        )}
        {onToggleStatus && (
          <Button
            type="button"
            variant="outline"
            onClick={onToggleStatus}
            isLoading={isToggling}
            className="min-h-9 gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs"
          >
            {!isToggling && <ToggleIcon aria-hidden="true" className="h-3.5 w-3.5" />}
            {toggleLabel}
          </Button>
        )}
        </div>
      </div>
    </article>
  );
}
