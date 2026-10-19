"use client";

import type { ComponentType } from "react";
import { useFormatter, useTranslations } from "next-intl";

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
  return <span className="whitespace-nowrap font-mono text-sm font-medium text-app-text">{member.memberNo}</span>;
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

// Business name with its type under it (admission form fields).
function BusinessCell({ member }: CellProps) {
  return (
    <div className="min-w-0">
      <p className="truncate text-app-text">{member.businessName || "—"}</p>
      {member.businessType && <p className="truncate text-xs text-app-text-muted">{member.businessType}</p>}
    </div>
  );
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

// The first nominee (+ how many more); opens the nominee popup
function NomineeCell({ member, onAction }: CellProps) {
  const t = useTranslations("Members.nominee");
  const tNominee = useTranslations("Nominees");
  const [first, ...others] = member.nominees ?? [];

  if (!first) return <span className="text-app-text-muted">—</span>;

  const relation =
    first.relation === "other" && first.relationNote ? first.relationNote : tNominee(`relation.${first.relation}`);

  return (
    <button
      type="button"
      onClick={() => onAction("nominee", member)}
      aria-label={t("open", { memberNo: member.memberNo })}
      className="group -mx-1.5 block max-w-full rounded-lg px-1.5 py-0.5 text-left transition-colors hover:bg-app-primary/5 focus-visible:outline-2 focus-visible:outline-app-focus"
    >
      <span className="flex items-center gap-1.5">
        <span className="truncate text-app-text underline decoration-app-border underline-offset-4 group-hover:text-app-primary group-hover:decoration-app-primary/40">
          {first.name}
        </span>
        {others.length > 0 && (
          <span className="shrink-0 rounded-full bg-app-surface-muted px-1.5 text-[11px] font-semibold text-app-text-muted">
            {t("more", { count: others.length })}
          </span>
        )}
      </span>
      <span className="block truncate text-xs text-app-text-muted">{relation}</span>
    </button>
  );
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
  { id: "name", headerKey: "name", sortField: "nameBn", className: "w-[26%]", Cell: NameCell },
  { id: "phone", headerKey: "phone", Cell: PhoneCell },
  { id: "business", headerKey: "business", className: "hidden max-w-56 xl:table-cell", Cell: BusinessCell },
  // NID only on very wide screens, so the Business column fits next to the sidebar.
  { id: "nid", headerKey: "nid", className: "hidden 2xl:table-cell", Cell: NidCell },
  // Desktop only (lg+); on phones the nominee is in View details
  { id: "nominee", headerKey: "nominee", className: "hidden min-w-40 max-w-56 lg:table-cell", Cell: NomineeCell },
  { id: "joinDate", headerKey: "joinDate", sortField: "joinDate", Cell: JoinDateCell },
  { id: "status", headerKey: "status", sortField: "status", Cell: StatusCell },
  { id: "actions", headerKey: "actions", className: "w-px text-right", Cell: ActionsCell },
];

// Reused by the mobile cards.
export { BusinessCell, JoinDateCell, MemberNoCell, NameCell, PhoneCell, StatusCell };
