import { adminDeposits } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/status-badge';

export default function AdminCollectionsPage() {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-app-text">Collections</h1>
        <span className="text-sm text-app-text-muted">Collected: ৳24,200</span>
      </div>
      <div className="grid gap-3">
        {adminDeposits.map((row) => (
          <div key={row.member} className="grid gap-3 rounded-xl border border-app-border bg-app-background p-3 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] md:items-center">
            <div>
              <div className="font-medium text-app-text">{row.member}</div>
              <div className="text-xs text-app-text-muted">{row.month}</div>
            </div>
            <input value={row.amount} className="h-11 rounded-lg border border-app-border bg-white px-3 text-sm text-app-text" readOnly />
            <div className="text-sm text-app-text-muted">Amount recorded</div>
            <StatusBadge label={row.status} />
          </div>
        ))}
      </div>
    </section>
  );
}