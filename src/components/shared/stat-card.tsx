import type { ReactNode } from 'react';

export function StatCard({
  title,
  value,
  meta,
  icon,
}: {
  title: string;
  value: string;
  meta?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
        {icon ? <span className="rounded-full bg-[rgba(15,107,79,0.12)] p-2 text-[var(--color-primary)]">{icon}</span> : null}
      </div>
      <div className="text-3xl font-bold tracking-tight text-[var(--color-text)]">{value}</div>
      {meta ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{meta}</p> : null}
    </div>
  );
}
