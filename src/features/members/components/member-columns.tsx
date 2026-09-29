"use client";

import type { ComponentType } from "react";
import { useFormatter } from "next-intl";

import type { Member, MemberSortField } from "../types";

import { MemberStatusBadge } from "./member-status-badge";

type CellProps = { member: Member };

export type MemberColumn = {
  id: string;
  /** Key under "Members.columns". */
  headerKey: string;
  /** Set only for fields the backend can sort by. */
  sortField?: MemberSortField;
  /** Extra classes for <th>/<td>, e.g. hide on smaller desktops. */
  className?: string;
  Cell: ComponentType<CellProps>;
};

// ── Cells ──────────────────────────────────────────────

function MemberNoCell({ member }: CellProps) {
  return <span className="font-mono text-sm font-medium text-app-text">{member.memberNo}</span>;
}

function NameCell({ member }: CellProps) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-app-text">{member.nameBn}</p>
      {member.nameEn && <p className="truncate text-xs text-app-text-muted">{member.nameEn}</p>}
    </div>
  );
}

function PhoneCell({ member }: CellProps) {
  return <span className="whitespace-nowrap text-app-text">{member.phone}</span>;
}

function NidCell({ member }: CellProps) {
  return <span className="font-mono text-xs text-app-text-muted">{member.nid}</span>;
}

// Dates are stored as UTC midnight of the day, so format them in UTC
// (otherwise a timezone west of UTC would show the previous day).
function JoinDateCell({ member }: CellProps) {
  const format = useFormatter();
  const joinDate = format.dateTime(new Date(member.joinDate), { dateStyle: "medium", timeZone: "UTC" });

  return <span className="whitespace-nowrap text-app-text">{joinDate}</span>;
}

function StatusCell({ member }: CellProps) {
  return <MemberStatusBadge status={member.status} />;
}

// ── Columns ────────────────────────────────────────────
// A future "Actions" column is one more entry here with its own Cell.

export const MEMBER_COLUMNS: MemberColumn[] = [
  { id: "memberNo", headerKey: "memberNo", sortField: "memberNo", Cell: MemberNoCell },
  { id: "name", headerKey: "name", sortField: "nameBn", className: "w-[30%]", Cell: NameCell },
  { id: "phone", headerKey: "phone", Cell: PhoneCell },
  { id: "nid", headerKey: "nid", className: "hidden xl:table-cell", Cell: NidCell },
  { id: "joinDate", headerKey: "joinDate", sortField: "joinDate", Cell: JoinDateCell },
  { id: "status", headerKey: "status", sortField: "status", Cell: StatusCell },
];

// Reused by the mobile cards.
export { JoinDateCell, MemberNoCell, NameCell, PhoneCell, StatusCell };
