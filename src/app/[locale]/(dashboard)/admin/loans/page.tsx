import { AppShell } from '@/components/shared/app-shell';
import { StatusBadge } from '@/components/shared/status-badge';
import { adminLoans } from '@/lib/mock-data';

export default function AdminLoansPage() {
  return (
    <AppShell variant="admin" title="Loans" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text)]">Eligibility rules</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Loan queue</h2>
          <span className="text-sm text-[var(--color-text-muted)]">7 total</span>
        </div>
        <div className="space-y-3">
          {adminLoans.map((loan) => (
            <div key={loan.member} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-[var(--color-text)]">{loan.member}</div>
                <div className="text-xs text-[var(--color-text-muted)]">Principal: ৳{loan.principal.toLocaleString()} · Due {loan.due}</div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge label={loan.status} />
                <button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Approve</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
