import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  /** The figure itself, usually <Money />. */
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative" | "warning";
  className?: string;
};

const TONES = {
  default: "bg-app-surface-muted text-app-primary",
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
};

// One number with its label: dashboards, report totals, year-end summaries.
export function StatCard({ label, value, hint, icon: Icon, tone = "default", className }: StatCardProps) {
  return (
    <div className={cn("flex min-w-0 items-start gap-3 rounded-2xl border border-app-border bg-app-surface p-4", className)}>
      {Icon && (
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONES[tone])}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-app-text-muted">{label}</p>
        <div className="mt-0.5 truncate text-lg font-semibold text-app-text sm:text-xl">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-app-text-muted">{hint}</div>}
      </div>
    </div>
  );
}

// A row of StatCards that wraps on small screens.
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>;
}
