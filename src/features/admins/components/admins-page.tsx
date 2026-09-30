"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, UserPlus, X } from "lucide-react";

import { ListEmpty, ListError, ListLoading } from "@/components/shared/list-states";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SelectMenu } from "@/components/ui/select-menu";
import { Spinner } from "@/components/ui/spinner";
import { useMe } from "@/features/auth/hooks/use-me";

import { useAdminListParams } from "../hooks/use-admin-list-params";
import { useAdmins } from "../hooks/use-admins";
import { ACCOUNT_STATUSES, type AccountStatus } from "../types";

import { STATUS_STYLES } from "./account-status-badge";
import { AdminsTable } from "./admins-table";
import { CreateAdminDialog } from "./create-admin-dialog";

// Mobile has no clickable table headers, so it gets a sort dropdown.
const SORT_OPTIONS = ["", "name", "-name", "-lastLogin", "status"];

// Admins list (GET /user?role=admin). Only a super admin can add an admin.
export function AdminsPage() {
  const t = useTranslations("Admins");
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";
  const { params, setParams, hasFilters, clearFilters } = useAdminListParams();
  const { data, error, isPending, isFetching, isPlaceholderData, refetch } = useAdmins(params);
  // New key per open remounts the dialog, so its form starts empty.
  const [createKey, setCreateKey] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const admins = data?.data ?? [];
  const meta = data?.meta;
  const showError = !!error && !data;
  const showEmpty = !!data && admins.length === 0;
  const isFilteredEmpty = hasFilters || (meta?.total ?? 0) > 0;
  const isUpdating = isFetching && (isPlaceholderData || !isPending);

  const statusOptions = [
    { value: "", label: t("filters.allStatuses") },
    ...ACCOUNT_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`), dot: STATUS_STYLES[status].dot })),
  ];
  const sortOptions = SORT_OPTIONS.map((option) => ({ value: option, label: t(`sort.${option || "default"}`) }));

  const openCreate = () => {
    setCreateKey((key) => key + 1);
    setIsCreateOpen(true);
  };
  const closeCreate = () => setIsCreateOpen(false);
  const retry = () => void refetch();
  const changeSearch = (search: string) => setParams({ search });
  const changeStatus = (status: string) => setParams({ status: status as AccountStatus | "" });
  const changeSort = (sort: string) => setParams({ sort });
  const changePage = (page: number) => setParams({ page });
  const changeLimit = (limit: number) => setParams({ limit });

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-app-text">{t("title")}</h1>
          <p className="mt-1 text-sm text-app-text-muted">{t("subtitle")}</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
            <UserPlus aria-hidden="true" className="h-4 w-4" />
            {t("addAdmin")}
          </Button>
        )}
      </header>

      <div className="space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <SearchInput
            id="admin-search"
            label={t("search.label")}
            placeholder={t("search.placeholder")}
            search={params.search}
            onSearchChange={changeSearch}
          />
          {hasFilters && (
            <Button type="button" variant="outline" onClick={clearFilters} className="gap-2 px-4">
              <X aria-hidden="true" className="h-4 w-4" />
              {t("filters.clear")}
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl
            aria-label={t("filters.status")}
            value={params.status}
            onChange={changeStatus}
            options={statusOptions}
          />
          <SelectMenu
            aria-label={t("sort.label")}
            value={params.sort}
            onChange={changeSort}
            options={sortOptions}
            className="md:hidden"
          />
        </div>
      </div>

      <section className="relative space-y-4">
        <p aria-live="polite" className="absolute -top-5 right-1 text-xs text-app-text-muted">
          {isUpdating && (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="h-3 w-3" />
              {t("updating")}
            </span>
          )}
        </p>

        {isPending && !showError && <ListLoading />}
        {showError && <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={isFetching} />}
        {showEmpty && (
          <ListEmpty
            icon={ShieldCheck}
            title={isFilteredEmpty ? t("empty.filteredTitle") : t("empty.title")}
            body={isFilteredEmpty ? t("empty.filteredBody") : t("empty.body")}
          />
        )}
        {admins.length > 0 && <AdminsTable admins={admins} sort={params.sort} onSortChange={changeSort} isUpdating={isUpdating} />}
        {meta && meta.total > 0 && <Pagination meta={meta} onPageChange={changePage} onLimitChange={changeLimit} />}
      </section>

      {isSuperAdmin && <CreateAdminDialog key={createKey} open={isCreateOpen} onClose={closeCreate} />}
    </div>
  );
}
