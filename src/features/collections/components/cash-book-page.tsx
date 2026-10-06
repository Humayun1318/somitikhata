"use client";

import { useTranslations } from "next-intl";
import { CirclePlus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListError, ListLoading } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/cn";

import { useCashAccounts, useCashBalance, useCashBook, useTransactionTypes } from "../hooks/use-collection-queries";
import { useTransactionDialogs } from "../hooks/use-transaction-dialogs";
import { useTransactionListParams } from "../hooks/use-transaction-list-params";

import { TransactionDialogs } from "./transaction-dialogs";
import { TransactionList } from "./transaction-list";

// One cash/bank account's entries (?account=<id>). Defaults to the first account.
export function CashBookPage() {
  const t = useTranslations("CashBook");
  const tCollections = useTranslations("Collections");
  const list = useTransactionListParams("account");
  const accounts = useCashAccounts();
  const accountList = accounts.data ?? [];
  const account = accountList.find((item) => item._id === list.scope) ?? accountList[0];
  const accountId = account?._id ?? "";

  const balance = useCashBalance(accountId);
  const cashBook = useCashBook(accountId, list.params);
  const catalog = useTransactionTypes();
  const dialogs = useTransactionDialogs();

  const accountOptions = accountList.map((item) => ({
    value: item._id,
    label: item.status === "closed" ? `${item.name} ${t("closed")}` : item.name,
    dot: item.status === "closed" ? "bg-slate-400" : "bg-emerald-500",
  }));

  const isClosed = account?.status === "closed";
  const retryAccounts = () => void accounts.refetch();
  const openRecord = () => dialogs.openRecord({ cashAccountId: isClosed ? undefined : accountId });

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Button onClick={openRecord} className="w-full gap-2 sm:w-auto">
          <CirclePlus aria-hidden="true" className="h-4 w-4" />
          {tCollections("recordTransaction")}
        </Button>
      </PageHeader>

      {accounts.isPending && <ListLoading rows={2} />}
      {accounts.isError && !accounts.data && (
        <ListError
          title={tCollections("accountsError")}
          retryLabel={tCollections("retry")}
          onRetry={retryAccounts}
          isRetrying={accounts.isFetching}
        />
      )}
      {accounts.data && !account && <p className="text-sm text-app-text-muted">{tCollections("accountsEmpty")}</p>}

      {account && (
        <section className="grid gap-4 rounded-2xl border border-app-border bg-app-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5">
          <div className="text-sm font-medium text-app-text">
            <label htmlFor="cash-book-account">{t("account")}</label>
            <SelectMenu
              id="cash-book-account"
              value={accountId}
              onChange={list.setScope}
              options={accountOptions}
              className="mt-1.5"
            />
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium text-app-text-muted">{t("currentBalance")}</p>
            {balance.data && (
              <Money
                paisa={balance.data.balance}
                className={cn("text-2xl font-bold", balance.data.balance < 0 ? "text-red-700" : "text-app-text")}
              />
            )}
            {balance.isPending && <div className="mt-1 h-8 w-40 animate-pulse rounded-lg bg-app-surface-muted sm:ml-auto" />}
            {balance.isError && !balance.data && <p className="text-sm text-red-600">{tCollections("balanceError")}</p>}
          </div>
        </section>
      )}

      {account && (
        <TransactionList
          variant="cashBook"
          query={cashBook}
          params={list.params}
          setParams={list.setParams}
          hasFilters={list.hasFilters}
          onClearFilters={list.clearFilters}
          catalog={catalog}
          onView={dialogs.openDetails}
        />
      )}

      <TransactionDialogs dialogs={dialogs} catalog={catalog} />
    </div>
  );
}
