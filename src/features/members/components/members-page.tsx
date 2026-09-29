"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useMemberListParams } from "../hooks/use-member-list-params";
import { useMembers } from "../hooks/use-members";

import { AddMemberDialog } from "./add-member-dialog";
import { MembersEmpty, MembersError, MembersLoading } from "./members-list-states";
import { MembersPagination } from "./members-pagination";
import { MembersTable } from "./members-table";
import { MembersToolbar } from "./members-toolbar";

// All Members: search/filter/sort/page live in the URL; the backend does the work.
export function MembersPage() {
  const t = useTranslations("Members");
  const { params, setParams, hasFilters, clearFilters } = useMemberListParams();
  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } = useMembers(params);

  const [isAddOpen, setIsAddOpen] = useState(false);
  // New key per open remounts the dialog, so its form starts empty.
  const [addDialogKey, setAddDialogKey] = useState(0);

  const members = data?.data ?? [];
  const meta = data?.meta;
  const showLoading = isPending;
  const showError = isError && !data;
  const showEmpty = !!data && members.length === 0;
  // "No results" (not "no members yet") when filtering, or on a page past the end.
  const isFilteredEmpty = hasFilters || (meta?.total ?? 0) > 0;
  const showTable = members.length > 0;
  // Old rows stay visible while the next page/search loads.
  const isUpdating = isFetching && (isPlaceholderData || !isPending);

  const openAddMember = () => {
    setAddDialogKey((key) => key + 1);
    setIsAddOpen(true);
  };
  const closeAddMember = () => setIsAddOpen(false);
  const retry = () => void refetch();
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
        <Button onClick={openAddMember} className="w-full gap-2 sm:w-auto">
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          {t("addMember")}
        </Button>
      </header>

      <MembersToolbar
        params={params}
        setParams={setParams}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />

      <section className="relative space-y-4">
        {/* Sits in the gap above the list, so it takes no extra space. */}
        <p aria-live="polite" className="absolute -top-5 right-1 text-xs text-app-text-muted">
          {isUpdating && (
            <span className="inline-flex items-center gap-1.5">
              <Spinner className="h-3 w-3" />
              {t("updating")}
            </span>
          )}
        </p>

        {showLoading && <MembersLoading />}
        {showError && <MembersError onRetry={retry} isRetrying={isFetching} />}
        {showEmpty && <MembersEmpty isFiltered={isFilteredEmpty} />}
        {showTable && (
          <MembersTable members={members} sort={params.sort} onSortChange={changeSort} isUpdating={isUpdating} />
        )}
        {meta && meta.total > 0 && (
          <MembersPagination meta={meta} onPageChange={changePage} onLimitChange={changeLimit} />
        )}
      </section>

      <AddMemberDialog key={addDialogKey} open={isAddOpen} onClose={closeAddMember} />
    </div>
  );
}
