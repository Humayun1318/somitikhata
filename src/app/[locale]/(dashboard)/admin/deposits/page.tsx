import { AppShell } from '@/components/shared/app-shell';
import { StatusBadge } from '@/components/shared/status-badge';
import { adminDeposits } from '@/lib/mock-data';

export default function AdminDepositsPage() {
  return (
    <AppShell variant="admin" title="Deposits" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Save month</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">August deposit entry</h2>
          <span className="text-sm text-[var(--color-text-muted)]">Collected: ৳24,200</span>
        </div>

        <div className="grid gap-3">
          {adminDeposits.map((row) => (
            <div key={row.member} className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] md:items-center">
              <div>
                <div className="font-medium text-[var(--color-text)]">{row.member}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{row.month}</div>
              </div>
              <input value={row.amount} className="h-11 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)]" readOnly />
              <div className="text-sm text-[var(--color-text-muted)]">Amount recorded</div>
              <StatusBadge label={row.status} />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
