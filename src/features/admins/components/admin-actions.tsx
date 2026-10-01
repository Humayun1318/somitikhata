"use client";

import { KeyRound, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import type { StaffUser } from "../types";

export type AdminAction = "changeStatus" | "resetPassword";

const ACTIONS = [
  { action: "changeStatus", Icon: UserCog },
  { action: "resetPassword", Icon: KeyRound },
] as const;

type AdminActionsProps = {
  admin: StaffUser;
  onAction: (action: AdminAction, admin: StaffUser) => void;
  /** "icons" for the desktop table, "buttons" (icon + text) for mobile cards. */
  variant: "icons" | "buttons";
};

// Each action only opens a dialog; the dialog's own button runs the request.
export function AdminActions({ admin, onAction, variant }: AdminActionsProps) {
  const t = useTranslations("Admins.actions");
  const isIcons = variant === "icons";
  const items = ACTIONS.map(({ action, Icon }) => ({
    action,
    Icon,
    label: t(action),
    ariaLabel: t("forAdmin", { action: t(action), name: admin.name }),
  }));

  return (
    <div className={cn("flex items-center", isIcons ? "justify-end gap-1" : "gap-2")}>
      {items.map(({ action, Icon, label, ariaLabel }) => (
        <button
          key={action}
          type="button"
          onClick={() => onAction(action, admin)}
          aria-label={ariaLabel}
          title={isIcons ? label : undefined}
          className={cn(
            "inline-flex items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text focus-visible:outline-2 focus-visible:outline-app-focus",
            isIcons
              ? "h-9 w-9"
              : "min-h-10 min-w-0 flex-1 gap-1.5 whitespace-nowrap border border-app-border px-2 text-xs font-medium text-app-text",
          )}
        >
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
          {!isIcons && <span className="truncate">{label}</span>}
        </button>
      ))}
    </div>
  );
}
