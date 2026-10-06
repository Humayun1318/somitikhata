"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Eye, HandCoins, Plus, X } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListEmpty, ListError, ListLoading, ListUpdatingHint } from "@/components/shared/list-states";
import { Money } from "@/components/shared/money";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";
import { cn } from "@/lib/cn";

import { useLoanListParams } from "../hooks/use-loan-list-params";
import { useLoans } from "../hooks/use-loans";
import { LOAN_STATUSES, type Loan, type LoanStatus } from "../types";

import { LoanApplyDialog } from "./loan-apply-dialog";
import { LoanDetailsDialog } from "./loan-details-dialog";
import { LOAN_STATUS_STYLES, LoanStatusBadge } from "./loan-status-badge";

type OpenDialog = { type: "apply" | "details"; loanNo: string; key: number };

// Admin loans (GET /loans): filter by status or member, open a loan to see
// its installments and move it on (approve / reject / disburse / collect).
export function LoansPage() {
  const t = useTranslations("Loans");
  const format = useFormatter();
  const { params, setParams, hasFilters, clearFilters } = useLoanListParams();
  const { data, error, isPending, isFetching, isPlaceholderData, refetch } = useLoans(params);
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loans = data?.data ?? [];
  const meta = data?.meta;
  const showError = !!error && !data;
  const showEmpty = !!data && loans.length === 0;
  const isFilteredEmpty = hasFilters || (meta?.total ?? 0) > 0;
  const isUpdating = isFetching && (isPlaceholderData || !isPending);
  const statusOptions = [
    { value: "", label: t("filters.allStatuses") },
    ...LOAN_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`), dot: LOAN_STATUS_STYLES[status].dot })),
  ];
  const day = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }) : "—";
  const rows = loans.map((loan) => ({
    loan,
    terms: t("terms", {
      rate: format.number(loan.interestRatePercent),
      months: format.number(loan.tenureMonths),
    }),
    applied: day(loan.appliedAt),
  }));

  const open = (type: OpenDialog["type"], loanNo = "") => {
    setDialog((current) => ({ type, loanNo, key: (current?.key ?? 0) + 1 }));
    setIsDialogOpen(true);
  };
  const viewLoan = (loan: Loan) => open("details", loan.loanNo);
  const close = () => setIsDialogOpen(false);
  const retry = () => void refetch();
  const changeStatus = (status: string) => setParams({ status: status as LoanStatus | "" });

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")}>
        <Button onClick={() => open("apply")} className="w-full gap-2 sm:w-auto">
          <Plus aria-hidden="true" className="h-4 w-4" />
          {t("newApplication")}
        </Button>
      </PageHeader>

      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchInput
            id="loan-search"
            label={t("filters.searchLabel")}
            placeholder={t("filters.searchPlaceholder")}
            search={params.search}
            onSearchChange={(search) => setParams({ search })}
          />
          <SearchInput
            id="loan-member"
            label={t("filters.memberLabel")}
            placeholder={t("filters.memberPlaceholder")}
            search={params.memberNo}
            onSearchChange={(memberNo) => setParams({ memberNo })}
          />
          {hasFilters && (
            <Button type="button" variant="outline" onClick={clearFilters} className="gap-2 px-4">
              <X aria-hidden="true" className="h-4 w-4" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
        <SegmentedControl aria-label={t("filters.status")} value={params.status} onChange={changeStatus} options={statusOptions} />
      </div>

      <section className="relative space-y-4">
        <ListUpdatingHint show={isUpdating} label={t("updating")} />

        {isPending && !showError && <ListLoading />}
        {showError && <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={isFetching} />}
        {showEmpty && (
          <ListEmpty
            icon={HandCoins}
            title={isFilteredEmpty ? t("empty.filteredTitle") : t("empty.title")}
            body={isFilteredEmpty ? t("empty.filteredBody") : t("empty.body")}
          />
        )}

        {rows.length > 0 && (
          <div className={cn("transition-opacity", isUpdating && "opacity-60")} aria-busy={isUpdating}>
            <div className="hidden overflow-x-auto rounded-2xl border border-app-border bg-app-surface md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-app-border bg-app-surface-muted/50 text-xs font-semibold text-app-text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-3">{t("columns.loanNo")}</th>
                    <th scope="col" className="px-4 py-3">{t("columns.member")}</th>
                    <th scope="col" className="px-4 py-3 text-right">{t("columns.principal")}</th>
                    <th scope="col" className="px-4 py-3">{t("columns.terms")}</th>
                    <th scope="col" className="px-4 py-3">{t("columns.applied")}</th>
                    <th scope="col" className="px-4 py-3">{t("columns.status")}</th>
                    <th scope="col" className="w-px px-4 py-3 text-right">{t("columns.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {rows.map(({ loan, terms, applied }) => (
                    <tr key={loan._id} className="transition-colors hover:bg-app-surface-muted/40">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-app-text">{loan.loanNo}</td>
                      <td className="px-4 py-3">
                        <p className="text-app-text">{loan.member.nameBn}</p>
                        <p className="font-mono text-xs text-app-text-muted">{loan.member.memberNo}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Money paisa={loan.principal} className="font-semibold text-app-text" />
                      </td>
                      <td className="px-4 py-3 text-app-text-muted">{terms}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-app-text">{applied}</td>
                      <td className="px-4 py-3">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => viewLoan(loan)}
                          aria-label={`${t("view")} ${loan.loanNo}`}
                          title={t("view")}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-primary"
                        >
                          <Eye aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {rows.map(({ loan, terms, applied }) => (
                <li key={loan._id}>
                  <button
                    type="button"
                    onClick={() => viewLoan(loan)}
                    className="w-full rounded-2xl border border-app-border bg-app-surface p-4 text-left transition-colors active:bg-app-surface-muted/60"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-app-text">{loan.member.nameBn}</span>
                        <span className="font-mono text-xs text-app-text-muted">{loan.member.memberNo}</span>
                      </span>
                      <Money paisa={loan.principal} className="shrink-0 font-semibold text-app-text" />
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                      <span className="font-mono">{loan.loanNo}</span>
                      <span>{terms}</span>
                      <span>{applied}</span>
                    </span>
                    <span className="mt-2 block">
                      <LoanStatusBadge status={loan.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {meta && meta.total > 0 && (
          <Pagination meta={meta} onPageChange={(page) => setParams({ page })} onLimitChange={(limit) => setParams({ limit })} />
        )}
      </section>

      {dialog?.type === "apply" && <LoanApplyDialog key={dialog.key} open={isDialogOpen} onClose={close} onApplied={(loanNo) => open("details", loanNo)} />}
      {dialog?.type === "details" && (
        <LoanDetailsDialog key={dialog.key} open={isDialogOpen} onClose={close} loanNo={dialog.loanNo} />
      )}
    </div>
  );
}
