"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BookOpenText, CirclePlus, FolderTree, History, Landmark, Plus, Wallet, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListError } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { useToast } from "@/components/shared/toast/toast-provider";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/hooks/use-me";
import { Link } from "@/i18n/navigation";

import { getCollectionError } from "../collection-errors";
import { useUpdateCashAccountStatus } from "../hooks/use-collection-mutations";
import { useCashAccounts, useCashBalances, useTransactionTypes } from "../hooks/use-collection-queries";
import { useTransactionDialogs } from "../hooks/use-transaction-dialogs";
import type { CashAccount } from "../types";

import { AccountCard } from "./account-card";
import { CashAccountDialog } from "./cash-account-dialog";
import { TransactionDialogs } from "./transaction-dialogs";

type Shortcut = { href: string; icon: LucideIcon; titleKey: string; bodyKey: string };

const SHORTCUTS: Shortcut[] = [
  { href: "/admin/collections/cash-book", icon: BookOpenText, titleKey: "cashBook", bodyKey: "cashBookBody" },
  { href: "/admin/collections/passbook", icon: Wallet, titleKey: "passbook", bodyKey: "passbookBody" },
  { href: "/admin/collections/society", icon: Landmark, titleKey: "society", bodyKey: "societyBody" },
  { href: "/admin/collections/heads", icon: FolderTree, titleKey: "heads", bodyKey: "headsBody" },
  { href: "/admin/collections/opening", icon: History, titleKey: "opening", bodyKey: "openingBody" },
];

// Collections home: every cash/bank account with its live balance.
export function CollectionsOverview() {
  const t = useTranslations("Collections");
  const tAccount = useTranslations("CashAccountForm");
  const tErrors = useTranslations("CollectionErrors");
  const locale = useLocale();
  const toast = useToast();
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";

  const accounts = useCashAccounts();
  const accountList = accounts.data ?? [];
  const balances = useCashBalances(accountList);
  const catalog = useTransactionTypes();
  const dialogs = useTransactionDialogs();
  const updateStatus = useUpdateCashAccountStatus();
  const [accountDialogKey, setAccountDialogKey] = useState(0);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  // Total of active accounts only; each balance is the backend's own figure.
  const activeBalances = accountList.flatMap((account, index) =>
    account.status === "active" ? [balances[index]] : [],
  );
  // `data`, not isSuccess: a failed background refetch keeps the last balance.
  const isTotalReady = !!accounts.data && activeBalances.every((balance) => balance?.data !== undefined);
  const total = activeBalances.reduce((sum, balance) => sum + (balance?.data?.balance ?? 0), 0);
  const firstActive = accountList.find((account) => account.status === "active");
  const togglingId = updateStatus.isPending ? updateStatus.variables?.id : undefined;

  const openRecord = () => dialogs.openRecord({ cashAccountId: firstActive?._id });
  const openAddAccount = () => {
    setAccountDialogKey((key) => key + 1);
    setIsAccountDialogOpen(true);
  };
  const closeAddAccount = () => setIsAccountDialogOpen(false);
  const retry = () => void accounts.refetch();

  const toggleStatus = async (account: CashAccount) => {
    if (updateStatus.isPending) return;
    const status = account.status === "active" ? "closed" : "active";
    try {
      await updateStatus.mutateAsync({ id: account._id, status });
      toast.success(tAccount(status === "closed" ? "closed" : "reopened", { name: account.name }));
    } catch (error) {
      toast.error(getCollectionError(error, tErrors, locale).formError ?? tErrors("generic"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Button onClick={openRecord} className="w-full gap-2 sm:w-auto">
          <CirclePlus aria-hidden="true" className="h-4 w-4" />
          {t("recordTransaction")}
        </Button>
      </PageHeader>

      <section className="rounded-2xl bg-app-primary p-5 text-white sm:p-6">
        <p className="text-sm font-medium text-white/80">{t("totalBalance")}</p>
        <div className="mt-2 min-h-10">
          {isTotalReady && <Money paisa={total} className="text-3xl font-bold sm:text-4xl" />}
          {!isTotalReady && <div className="h-10 w-52 animate-pulse rounded-lg bg-white/20" />}
        </div>
        <p className="mt-1 text-xs text-white/70">{t("totalBalanceHint")}</p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-app-text">{t("accountsTitle")}</h2>
          {isSuperAdmin && (
            <Button type="button" variant="outline" onClick={openAddAccount} className="min-h-10 gap-1.5 px-3.5 py-2">
              <Plus aria-hidden="true" className="h-4 w-4" />
              {t("addAccount")}
            </Button>
          )}
        </div>

        {accounts.isPending && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-app-surface-muted" />
            ))}
          </div>
        )}
        {accounts.isError && !accounts.data && (
          <ListError title={t("accountsError")} retryLabel={t("retry")} onRetry={retry} isRetrying={accounts.isFetching} />
        )}
        {accounts.data && accountList.length === 0 && <p className="text-sm text-app-text-muted">{t("accountsEmpty")}</p>}
        {accountList.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accountList.map((account, index) => (
              <AccountCard
                key={account._id}
                account={account}
                balance={balances[index]?.data?.balance}
                isBalanceError={!!balances[index]?.isError && balances[index]?.data === undefined}
                onToggleStatus={isSuperAdmin ? () => void toggleStatus(account) : undefined}
                isToggling={togglingId === account._id}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-app-text">{t("shortcuts.title")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SHORTCUTS.map(({ href, icon: Icon, titleKey, bodyKey }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-start gap-3 rounded-2xl border border-app-border bg-app-surface p-4 transition-colors hover:border-app-primary/40 hover:bg-app-primary/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-surface-muted text-app-primary">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-app-text group-hover:text-app-primary">{t(`shortcuts.${titleKey}`)}</span>
                <span className="mt-0.5 block text-sm text-app-text-muted">{t(`shortcuts.${bodyKey}`)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <TransactionDialogs dialogs={dialogs} catalog={catalog} />
      {isSuperAdmin && (
        <CashAccountDialog key={accountDialogKey} open={isAccountDialogOpen} onClose={closeAddAccount} />
      )}
    </div>
  );
}
