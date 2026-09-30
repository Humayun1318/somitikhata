import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

import { Button } from "./button";

type DialogActionsProps = {
  cancelLabel: string;
  onCancel: () => void;
  /** The primary button. Without `onAction` it is the form's submit button. */
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  tone?: "primary" | "danger";
  isBusy?: boolean;
  actionDisabled?: boolean;
  /** Extra buttons shown between Cancel and the primary button. */
  children?: ReactNode;
};

// The standard dialog footer: Cancel, then the primary action on the right.
export function DialogActions({
  cancelLabel,
  onCancel,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  tone = "primary",
  isBusy = false,
  actionDisabled = false,
  children,
}: DialogActionsProps) {
  const actionType = onAction ? "button" : "submit";
  // Cancel + one action: side by side on phones too. More buttons: stacked on phones.
  const isPair = !children && !!actionLabel;

  return (
    <div
      className={cn(
        "gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-end",
        isPair ? "grid grid-cols-2" : "flex flex-col-reverse",
      )}
    >
      <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy} className="w-full sm:w-auto sm:min-w-28">
        {cancelLabel}
      </Button>
      {children}
      {actionLabel && (
        <Button
          type={actionType}
          variant={tone === "danger" ? "danger" : "primary"}
          onClick={onAction}
          isLoading={isBusy}
          disabled={actionDisabled}
          className="w-full gap-2 sm:w-auto sm:min-w-32"
        >
          {ActionIcon && !isBusy && <ActionIcon aria-hidden="true" className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
