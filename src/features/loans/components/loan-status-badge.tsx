"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

import type { LoanStatus } from "../types";

// One color per step of a loan: waiting, approved, running, done, refused.
export const LOAN_STATUS_STYLES: Record<LoanStatus, { badge: string; dot: string }> = {
  applied: { badge: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  approved: { badge: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  active: { badge: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  closed: { badge: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  rejected: { badge: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const t = useTranslations("Loans.status");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        LOAN_STATUS_STYLES[status].badge,
      )}
    >
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", LOAN_STATUS_STYLES[status].dot)} />
      {t(status)}
    </span>
  );
}
