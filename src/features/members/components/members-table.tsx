"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import type { Member } from "../types";

import { MemberActions, type MemberAction } from "./member-actions";

import {
  JoinDateCell,
  MEMBER_COLUMNS,
  MemberNoCell,
  NameCell,
  PhoneCell,
  StatusCell,
} from "./member-columns";
import { getAriaSort, SortableHeader } from "./sortable-header";

type MembersTableProps = {
  members: Member[];
  sort: string;
  onSortChange: (sort: string) => void;
  /** True while a new page/search is loading and old rows are still shown. */
  isUpdating: boolean;
  onAction: (action: MemberAction, member: Member) => void;
};

// Desktop: a real table. Mobile: one card per member (tables don't fit phones).
export function MembersTable({ members, sort, onSortChange, isUpdating, onAction }: MembersTableProps) {
  const t = useTranslations("Members");
  const columns = MEMBER_COLUMNS.map((column) => {
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
                <th
                  key={id}
                  scope="col"
                  aria-sort={getAriaSort(sortField, sort)}
                  className={cn("px-4 py-3 font-semibold", className)}
                >
                  {sortField && (
                    <SortableHeader
                      label={label}
                      sortLabel={sortLabel}
                      field={sortField}
                      sort={sort}
                      onSortChange={onSortChange}
                    />
                  )}
                  {!sortField && label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {members.map((member) => (
              <tr key={member._id} className="transition-colors hover:bg-app-surface-muted/40">
                {columns.map(({ id, className, Cell }) => (
                  <td key={id} className={cn("px-4 py-3 align-middle", className)}>
                    <Cell member={member} onAction={onAction} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {members.map((member) => (
          <li key={member._id} className="rounded-2xl border border-app-border bg-app-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <NameCell member={member} onAction={onAction} />
              <StatusCell member={member} onAction={onAction} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <MemberNoCell member={member} onAction={onAction} />
              <PhoneCell member={member} onAction={onAction} />
              <span className="text-app-text-muted">
                <JoinDateCell member={member} onAction={onAction} />
              </span>
            </div>
            <div className="mt-3 border-t border-app-border pt-3">
              <MemberActions member={member} onAction={onAction} variant="buttons" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
