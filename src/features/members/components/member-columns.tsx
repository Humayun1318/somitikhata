"use client";

import type { ComponentType } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Eye, UsersRound } from "lucide-react";

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

// An action button: the first nominee (+ how many more) and "View".
// Opens the nominee popup with everything about them.
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
      title={t("open", { memberNo: member.memberNo })}
      className="group flex w-full max-w-56 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-2.5 py-1.5 text-left transition-colors hover:border-app-primary/40 hover:bg-app-primary/5 focus-visible:outline-2 focus-visible:outline-app-focus"
    >
      <UsersRound aria-hidden="true" className="h-4 w-4 shrink-0 text-app-primary" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium text-app-text">{first.name}</span>
          {others.length > 0 && (
            <span className="shrink-0 rounded-full bg-app-surface-muted px-1.5 text-[11px] font-semibold text-app-text-muted">
              {t("more", { count: others.length })}
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-app-text-muted">{relation}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-app-primary">
        <Eye aria-hidden="true" className="h-3.5 w-3.5" />
        {t("view")}
      </span>
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
  // Desktop (lg+): narrower screens would push Status and Actions out of view.
  // On phones and tablets the nominee is in View details.
  { id: "nominee", headerKey: "nominee", className: "hidden min-w-44 max-w-60 lg:table-cell", Cell: NomineeCell },
  { id: "joinDate", headerKey: "joinDate", sortField: "joinDate", Cell: JoinDateCell },
  { id: "status", headerKey: "status", sortField: "status", Cell: StatusCell },
  { id: "actions", headerKey: "actions", className: "w-px text-right", Cell: ActionsCell },
];

// Reused by the mobile cards.
export { BusinessCell, JoinDateCell, MemberNoCell, NameCell, PhoneCell, StatusCell };
