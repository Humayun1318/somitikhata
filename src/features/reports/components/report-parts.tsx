"use client";

import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Money } from "@/components/shared/money";
import { cn } from "@/lib/cn";

import type { ReportLine } from "../types";

// The printed sheet: a heading with the period, then the report body.
export function ReportSheet({ title, period, children }: { title: string; period: string; children: ReactNode }) {
  return (
    <article className="space-y-4 rounded-2xl border border-app-border bg-app-surface p-4 sm:p-6 print:border-0 print:p-0">
      <header className="border-b border-app-border pb-3 text-center">
        <h2 className="text-lg font-semibold text-app-text">{title}</h2>
        <p className="mt-0.5 text-sm text-app-text-muted">{period}</p>
      </header>
      {children}
    </article>
  );
}

type Row = { key: string; label: ReactNode; amount: number; strong?: boolean; muted?: boolean };

// One side of a two-sided paper form (receipts | payments, expense | income …).
export function ReportColumn({ title, rows, total, totalLabel }: { title: string; rows: Row[]; total: number; totalLabel: string }) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-app-border">
      <h3 className="border-b border-app-border bg-app-surface-muted/70 px-3 py-2 text-sm font-semibold text-app-text">{title}</h3>
      <ul className="flex-1 divide-y divide-app-border/70">
        {rows.map((row) => (
          <li key={row.key} className={cn("flex items-baseline justify-between gap-3 px-3 py-2 text-sm", row.muted && "text-app-text-muted")}>
            <span className={cn("min-w-0", row.strong && "font-semibold")}>{row.label}</span>
            <Money paisa={row.amount} className={cn(row.strong && "font-semibold")} />
          </li>
        ))}
        {rows.length === 0 && <li className="px-3 py-4 text-center text-sm text-app-text-muted">—</li>}
      </ul>
      <p className="flex items-baseline justify-between gap-3 border-t-2 border-app-border px-3 py-2 text-sm font-bold text-app-text">
        <span>{totalLabel}</span>
        <Money paisa={total} />
      </p>
    </section>
  );
}

export const linesToRows = (lines: ReportLine[]): Row[] =>
  lines.map((line) => ({ key: line.key, label: line.label, amount: line.amount }));

// Shown when the two sides do not agree (a missing opening, an entry in
// an account the report does not cover …). 0 means the books balance.
export function DifferenceNote({ difference, message }: { difference: number; message: string }) {
  if (difference === 0) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {message} <Money paisa={difference} className="font-semibold" />
      </span>
    </p>
  );
}

export function TwoColumns({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">{children}</div>;
}
