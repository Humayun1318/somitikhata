"use client";

import { ReceiptText } from "lucide-react";
import { useTranslations } from "next-intl";

import { ListEmpty, ListError, ListLoading } from "@/components/shared/list-states";
import { Pagination } from "@/components/shared/pagination";
import { Spinner } from "@/components/ui/spinner";
import type { ApiError } from "@/lib/api-errors";
import type { PaginatedResult } from "@/types/api";

import type { TransactionTypeCatalog } from "../hooks/use-collection-queries";
import type { Transaction, TransactionListParams } from "../types";

import { TransactionsTable, type TransactionListVariant } from "./transactions-table";
import { TransactionsToolbar } from "./transactions-toolbar";

type TransactionListProps = {
  variant: TransactionListVariant;
  query: {
    data?: PaginatedResult<Transaction>;
    error: ApiError | null;
    isPending: boolean;
    isFetching: boolean;
    isPlaceholderData: boolean;
    refetch: () => unknown;
  };
  params: TransactionListParams;
  setParams: (changes: Partial<TransactionListParams>) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  catalog: TransactionTypeCatalog;
  onView: (transaction: Transaction) => void;
};

// Toolbar + table + pagination, shared by the cash book and the passbook.
export function TransactionList({
  variant,
  query,
  params,
  setParams,
  hasFilters,
  onClearFilters,
  catalog,
  onView,
}: TransactionListProps) {
  const t = useTranslations("Collections");
  const { data, error, isPending, isFetching, isPlaceholderData } = query;

  const transactions = data?.data ?? [];
  const meta = data?.meta;
  const showError = !!error && !data;
  const showLoading = isPending && !showError;
  const showEmpty = !!data && transactions.length === 0;
  const isFilteredEmpty = hasFilters || (meta?.total ?? 0) > 0;
  const isUpdating = isFetching && (isPlaceholderData || !isPending);

  const retry = () => void query.refetch();
  const changeSort = (sort: string) => setParams({ sort });
  const changePage = (page: number) => setParams({ page });
  const changeLimit = (limit: number) => setParams({ limit });

  return (
    <div className="space-y-4">
      <TransactionsToolbar
        variant={variant}
        params={params}
        setParams={setParams}
        types={catalog.all}
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
      />

      {catalog.isError && <p className="text-xs text-amber-700">{t("typesError")}</p>}

      <section className="relative space-y-4">
        <p aria-live="polite" className="absolute -top-5 right-1 text-xs text-app-text-muted">
          {isUpdating && (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="h-3 w-3" />
              {t("updating")}
            </span>
          )}
        </p>

        {showLoading && <ListLoading />}
        {showError && <ListError title={t("listError")} retryLabel={t("retry")} onRetry={retry} isRetrying={isFetching} />}
        {showEmpty && (
          <ListEmpty
            icon={ReceiptText}
            title={isFilteredEmpty ? t("empty.filteredTitle") : t("empty.title")}
            body={isFilteredEmpty ? t("empty.filteredBody") : t("empty.body")}
          />
        )}
        {transactions.length > 0 && (
          <TransactionsTable
            variant={variant}
            transactions={transactions}
            byCode={catalog.byCode}
            sort={params.sort}
            onSortChange={changeSort}
            isUpdating={isUpdating}
            onView={onView}
          />
        )}
        {meta && meta.total > 0 && <Pagination meta={meta} onPageChange={changePage} onLimitChange={changeLimit} />}
      </section>
    </div>
  );
}
