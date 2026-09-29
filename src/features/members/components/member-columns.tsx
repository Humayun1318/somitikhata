"use client";

import type { ComponentType } from "react";
import { useFormatter } from "next-intl";

import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import type { Member, MemberSortField } from "../types";

import { MemberActions, type MemberAction } from "./member-actions";
import { MemberStatusBadge } from "./member-status-badge";

type CellProps = {
  member: Member;
  /** Only the Actions cell uses this. */
  onAction: (action: MemberAction, member: Member) => void;
};

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

// Day-only dates are read in Dhaka time (see lib/dhaka-date.ts).
function JoinDateCell({ member }: CellProps) {
  const format = useFormatter();
  const joinDate = format.dateTime(new Date(member.joinDate), {
    dateStyle: "medium",
    timeZone: DHAKA_TIME_ZONE,
  });

  return <span className="whitespace-nowrap text-app-text">{joinDate}</span>;
}

function StatusCell({ member }: CellProps) {
  return <MemberStatusBadge status={member.status} />;
}

function ActionsCell({ member, onAction }: CellProps) {
  return <MemberActions member={member} onAction={onAction} variant="icons" />;
}

// ── Columns ────────────────────────────────────────────

export const MEMBER_COLUMNS: MemberColumn[] = [
  { id: "memberNo", headerKey: "memberNo", sortField: "memberNo", Cell: MemberNoCell },
  { id: "name", headerKey: "name", sortField: "nameBn", className: "w-[30%]", Cell: NameCell },
  { id: "phone", headerKey: "phone", Cell: PhoneCell },
  { id: "nid", headerKey: "nid", className: "hidden xl:table-cell", Cell: NidCell },
  { id: "joinDate", headerKey: "joinDate", sortField: "joinDate", Cell: JoinDateCell },
  { id: "status", headerKey: "status", sortField: "status", Cell: StatusCell },
  { id: "actions", headerKey: "actions", className: "w-px text-right", Cell: ActionsCell },
];

// Reused by the mobile cards.
export { JoinDateCell, MemberNoCell, NameCell, PhoneCell, StatusCell };
