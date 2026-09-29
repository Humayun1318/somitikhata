import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import type { MemberStatus } from "../types";

const STATUS_STYLES: Record<MemberStatus, { badge: string; dot: string }> = {
  active: { badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  inactive: { badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  suspended: { badge: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  exited: { badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  const t = useTranslations("Members.status");
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  const label = t.has(status) ? t(status) : status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        styles.badge,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {label}
    </span>
  );
}
