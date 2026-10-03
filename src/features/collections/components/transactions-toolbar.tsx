"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { cn } from "@/lib/cn";

import { isSocietyType, typeName } from "../transaction-effects";
import type { CashAccount, HeadBalance, TransactionListParams, TransactionType } from "../types";

import { AmountFilterInput } from "./amount-filter-input";
import type { TransactionListVariant } from "./transactions-table";

// Mobile has no clickable table headers, so it gets a sort dropdown.
const SORT_OPTIONS = ["", "transactionDate", "-amount", "amount", "-createdAt", "transactionNo"];

type TransactionsToolbarProps = {
  variant: TransactionListVariant;
  params: TransactionListParams;
  setParams: (changes: Partial<TransactionListParams>) => void;
  types: TransactionType[];
  hasFilters: boolean;
  onClearFilters: () => void;
  /** Samiti entries only: filter by ledger head and by account. */
  heads?: HeadBalance[];
  accounts?: CashAccount[];
};

// A cash book lists only entries that move cash; a passbook only member
// entries; the samiti list its own types.
function fitsVariant(type: TransactionType, variant: TransactionListVariant, byCode: Map<string, TransactionType>) {
  if (variant === "society") return isSocietyType(type, byCode);
  return variant === "cashBook" ? type.cashEffect !== "none" : type.memberRule !== "none";
}

export function TransactionsToolbar({
  variant,
  params,
  setParams,
  types,
  hasFilters,
  onClearFilters,
  heads,
  accounts,
}: TransactionsToolbarProps) {
  const t = useTranslations("Collections");
  const locale = useLocale();
  const hasPanelFilter = !!(
    params.startTransactionDate ||
    params.endTransactionDate ||
    params.minAmount ||
    params.maxAmount ||
    params.cashAccount
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(hasPanelFilter);

  const byCode = new Map(types.map((type) => [type.code, type]));
  const shownTypes = types.filter((type) => fitsVariant(type, variant, byCode));
  const regularTypes = shownTypes.filter((type) => type.typeGroup !== "reversal");
  const reversalTypes = shownTypes.filter((type) => type.typeGroup === "reversal");

  const typeOptions = [
    { value: "", label: t("filters.allTypes") },
    ...regularTypes.map((type) => ({ value: type._id, label: typeName(type, locale), group: t("filters.types") })),
    ...reversalTypes.map((type) => ({ value: type._id, label: typeName(type, locale), group: t("filters.reversalTypes") })),
  ];
  const sortOptions = SORT_OPTIONS.map((option) => ({ value: option, label: t(`sort.${option || "default"}`) }));
  const headOptions = heads
    ? [
        { value: "", label: t("filters.allHeads") },
        ...heads.map((head) => ({ value: head._id, label: typeName(head, locale), group: t(`headKinds.${head.kind}`) })),
      ]
    : [];
  const accountOptions = accounts
    ? [{ value: "", label: t("filters.allAccounts") }, ...accounts.map((account) => ({ value: account._id, label: account.name }))]
    : [];

  const toggleFilters = () => setIsFiltersOpen((open) => !open);
  const handleSearchChange = (search: string) => setParams({ search });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <SearchInput
          id={`${variant}-search`}
          label={t("filters.searchLabel")}
          placeholder={t("filters.searchPlaceholder")}
          search={params.search}
          onSearchChange={handleSearchChange}
        />
        <SelectMenu
          aria-label={t("filters.type")}
          value={params.transactionType}
          onChange={(transactionType) => setParams({ transactionType })}
          options={typeOptions}
          searchable
          highlighted={!!params.transactionType}
          className="sm:w-60"
        />
        {heads && (
          <SelectMenu
            aria-label={t("filters.head")}
            value={params.head}
            onChange={(head) => setParams({ head })}
            options={headOptions}
            searchable
            highlighted={!!params.head}
            className="sm:w-56"
          />
        )}
        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={toggleFilters}
            aria-expanded={isFiltersOpen}
            aria-controls={`${variant}-filters`}
            className={cn("flex-1 gap-2 px-4 sm:flex-none", hasPanelFilter && "border-app-primary text-app-primary")}
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            {t("filters.toggle")}
          </Button>
          {hasFilters && (
            <Button type="button" variant="outline" onClick={onClearFilters} className="flex-1 gap-2 px-4 sm:flex-none">
              <X aria-hidden="true" className="h-4 w-4" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
      </div>

      {isFiltersOpen && (
        <div
          id={`${variant}-filters`}
          className="grid gap-3 rounded-2xl border border-app-border bg-app-surface p-4 motion-safe:animate-fade-in-up sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="text-sm font-medium text-app-text">
            {t("filters.dateFrom")}
            <Input
              type="date"
              value={params.startTransactionDate}
              max={params.endTransactionDate || undefined}
              onChange={(event) => setParams({ startTransactionDate: event.target.value })}
              className="mt-1.5 min-h-11"
            />
          </label>
          <label className="text-sm font-medium text-app-text">
            {t("filters.dateTo")}
            <Input
              type="date"
              value={params.endTransactionDate}
              min={params.startTransactionDate || undefined}
              onChange={(event) => setParams({ endTransactionDate: event.target.value })}
              className="mt-1.5 min-h-11"
            />
          </label>
          {accounts && (
            <div className="text-sm font-medium text-app-text">
              <label htmlFor={`${variant}-account`}>{t("filters.account")}</label>
              <SelectMenu
                id={`${variant}-account`}
                value={params.cashAccount}
                onChange={(cashAccount) => setParams({ cashAccount })}
                options={accountOptions}
                highlighted={!!params.cashAccount}
                className="mt-1.5"
              />
            </div>
          )}
          <AmountFilterInput
            key={`min-${params.minAmount}`}
            label={t("filters.minAmount")}
            value={params.minAmount}
            onCommit={(minAmount) => setParams({ minAmount })}
          />
          <AmountFilterInput
            key={`max-${params.maxAmount}`}
            label={t("filters.maxAmount")}
            value={params.maxAmount}
            onCommit={(maxAmount) => setParams({ maxAmount })}
          />
          <div className="text-sm font-medium text-app-text md:hidden">
            <label htmlFor={`${variant}-sort`}>{t("filters.sort")}</label>
            <SelectMenu
              id={`${variant}-sort`}
              value={params.sort}
              onChange={(sort) => setParams({ sort })}
              options={sortOptions}
              className="mt-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
