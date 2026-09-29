"use client";

import { Eye, Pencil, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import type { Member } from "../types";

export type MemberAction = "view" | "edit" | "changeStatus";

const ACTIONS = [
  { action: "view", Icon: Eye },
  { action: "edit", Icon: Pencil },
  { action: "changeStatus", Icon: RefreshCw },
] as const;

type MemberActionsProps = {
  member: Member;
  onAction: (action: MemberAction, member: Member) => void;
  /** "icons" for the desktop table, "buttons" (icon + text) for mobile cards. */
  variant: "icons" | "buttons";
};

// Each action only opens a dialog; the dialog's own button runs the request.
export function MemberActions({ member, onAction, variant }: MemberActionsProps) {
  const t = useTranslations("Members.actions");
  const isIcons = variant === "icons";
  const items = ACTIONS.map(({ action, Icon }) => ({
    action,
    Icon,
    label: t(action),
    // Short text for the mobile buttons, so three fit in one row.
    shortLabel: t(`short.${action}`),
    ariaLabel: t("forMember", { action: t(action), memberNo: member.memberNo }),
  }));

  return (
    <div className={cn("flex items-center", isIcons ? "justify-end gap-1" : "gap-2")}>
      {items.map(({ action, Icon, label, shortLabel, ariaLabel }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action, member)}
          aria-label={ariaLabel}
          title={isIcons ? label : undefined}
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text focus-visible:outline-2 focus-visible:outline-app-focus",
            isIcons
              ? "h-9 w-9"
              : "min-h-10 min-w-0 flex-1 gap-1.5 whitespace-nowrap border border-app-border px-1.5 text-xs font-medium text-app-text",
          )}
        >
          {/* Very narrow phones (< 360px): text only, so the words are never cut. */}
          <Icon aria-hidden="true" className={cn("h-4 w-4 shrink-0", !isIcons && "max-[359px]:hidden")} />
          {!isIcons && <span className="truncate">{shortLabel}</span>}
        </button>
      ))}
    </div>
  );
}
