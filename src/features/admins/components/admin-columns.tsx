"use client";

import type { ComponentType } from "react";
import { KeyRound } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import type { AdminSortField, StaffUser } from "../types";

import { AccountStatusBadge } from "./account-status-badge";

type CellProps = { admin: StaffUser };

export type AdminColumn = {
  id: string;
  /** Key under "Admins.columns". */
  headerKey: string;
  sortField?: AdminSortField;
  className?: string;
  Cell: ComponentType<CellProps>;
};

// ── Cells ──────────────────────────────────────────────

export function NameCell({ admin }: CellProps) {
  const t = useTranslations("Admins");
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-app-text">{admin.name}</p>
      {admin.email && <p className="truncate text-xs text-app-text-muted">{admin.email}</p>}
      {admin.mustChangePassword && (
        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
          <KeyRound aria-hidden="true" className="h-3 w-3" />
          {t("mustChangePassword")}
        </p>
      )}
    </div>
  );
}

export function StaffNoCell({ admin }: CellProps) {
  return <span className="font-mono text-sm font-medium text-app-text">{admin.staffNo ?? "—"}</span>;
}

export function PhoneCell({ admin }: CellProps) {
  return <span className="whitespace-nowrap text-app-text">{admin.phone}</span>;
}

export function StatusCell({ admin }: CellProps) {
  return <AccountStatusBadge status={admin.status} />;
}

// Moments (not day-only dates), shown in Dhaka time.
export function LastLoginCell({ admin }: CellProps) {
  const t = useTranslations("Admins");
  const format = useFormatter();
  const text = admin.lastLogin
    ? format.dateTime(new Date(admin.lastLogin), { dateStyle: "medium", timeStyle: "short", timeZone: DHAKA_TIME_ZONE })
    : t("neverLoggedIn");
  return <span className={admin.lastLogin ? "whitespace-nowrap text-app-text" : "text-app-text-muted"}>{text}</span>;
}

export function AddedCell({ admin }: CellProps) {
  const format = useFormatter();
  const date = admin.createdAt ? format.dateTime(new Date(admin.createdAt), { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }) : "—";
  const by = typeof admin.createdBy === "object" && admin.createdBy ? admin.createdBy.name : "";
  return (
    <div className="min-w-0">
      <p className="whitespace-nowrap text-app-text">{date}</p>
      {by && <p className="truncate text-xs text-app-text-muted">{by}</p>}
    </div>
  );
}

// ── Columns ────────────────────────────────────────────

export const ADMIN_COLUMNS: AdminColumn[] = [
  { id: "name", headerKey: "name", sortField: "name", className: "w-[30%]", Cell: NameCell },
  { id: "staffNo", headerKey: "staffNo", Cell: StaffNoCell },
  { id: "phone", headerKey: "phone", Cell: PhoneCell },
  { id: "status", headerKey: "status", sortField: "status", Cell: StatusCell },
  { id: "lastLogin", headerKey: "lastLogin", sortField: "lastLogin", className: "hidden lg:table-cell", Cell: LastLoginCell },
  { id: "added", headerKey: "added", sortField: "createdAt", className: "hidden xl:table-cell", Cell: AddedCell },
];
