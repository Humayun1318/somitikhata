import { AppShell } from '@/components/shared/app-shell';
import { reportsSummary } from '@/lib/mock-data';

export default function AdminReportsPage() {
  return (
    <AppShell variant="admin" title="Reports" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text)]">Export PDF</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-5 text-xl font-semibold text-[var(--color-text)]">Summary overview</div>
        <div className="grid gap-4 md:grid-cols-3">
          {reportsSummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <div className="text-sm text-[var(--color-text-muted)]">{item.label}</div>
              <div className="mt-2 text-2xl font-bold text-[var(--color-text)]">{item.value}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
