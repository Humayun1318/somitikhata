"use client";

import { useTranslations } from "next-intl";

import { getAriaSort, SortableHeader } from "@/components/shared/sortable-header";
import { cn } from "@/lib/cn";

import type { StaffUser } from "../types";

import { ADMIN_COLUMNS, LastLoginCell, NameCell, PhoneCell, StaffNoCell, StatusCell } from "./admin-columns";

type AdminsTableProps = {
  admins: StaffUser[];
  sort: string;
  onSortChange: (sort: string) => void;
  isUpdating: boolean;
};

// Desktop: a table. Mobile: one card per admin.
export function AdminsTable({ admins, sort, onSortChange, isUpdating }: AdminsTableProps) {
  const t = useTranslations("Admins");
  const columns = ADMIN_COLUMNS.map((column) => {
    const label = t(`columns.${column.headerKey}`);
    return { ...column, label, sortLabel: t("sortBy", { column: label }) };
  });

  return (
    <div className={cn("transition-opacity", isUpdating && "opacity-60")} aria-busy={isUpdating}>
      <div className="hidden overflow-x-auto rounded-2xl border border-app-border bg-app-surface md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-app-border bg-app-surface-muted/50 text-xs font-semibold text-app-text-muted">
            <tr>
              {columns.map(({ id, label, sortLabel, sortField, className }) => (
                <th key={id} scope="col" aria-sort={getAriaSort(sortField, sort)} className={cn("px-4 py-3 font-semibold", className)}>
                  {sortField && <SortableHeader label={label} sortLabel={sortLabel} field={sortField} sort={sort} onSortChange={onSortChange} />}
                  {!sortField && label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {admins.map((admin) => (
              <tr key={admin._id} className="transition-colors hover:bg-app-surface-muted/40">
                {columns.map(({ id, className, Cell }) => (
                  <td key={id} className={cn("px-4 py-3 align-middle", className)}>
                    <Cell admin={admin} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {admins.map((admin) => (
          <li key={admin._id} className="rounded-2xl border border-app-border bg-app-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <NameCell admin={admin} />
              <StatusCell admin={admin} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <StaffNoCell admin={admin} />
              <PhoneCell admin={admin} />
            </div>
            <p className="mt-2 text-xs text-app-text-muted">
              {t("columns.lastLogin")}: <LastLoginCell admin={admin} />
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
