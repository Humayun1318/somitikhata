
import { adminDeposits, adminLoans, adminMembers, adminStats } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/status-badge';

export default function AdminDashboardPage() {
  const stats = adminStats.en;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-app-primary">Committee overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">Good morning, Admin</h1>
          <p className="mt-1 text-sm text-app-text-muted">Here is the latest activity across Bottoli Cooperative.</p>
        </div>
        <button className="w-fit rounded-lg bg-app-primary px-4 py-2.5 text-sm font-semibold text-white">Download report</button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded-2xl border border-app-border bg-app-surface p-5">
            <p className="text-sm text-app-text-muted">{stat.title}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-app-text">{stat.value}</p>
            <p className="mt-2 text-xs font-medium text-app-primary">{stat.meta}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-app-text">Recent collections</h2>
              <p className="mt-1 text-sm text-app-text-muted">August 2026 collection activity</p>
            </div>
            <span className="rounded-full bg-app-primary/10 px-3 py-1 text-xs font-semibold text-app-primary">Live</span>
          </div>
          <div className="space-y-3">
            {adminDeposits.map((deposit) => (
              <div key={deposit.member} className="flex items-center justify-between gap-4 rounded-xl border border-app-border bg-app-background p-3">
                <div>
                  <p className="font-medium text-app-text">{deposit.member}</p>
                  <p className="mt-1 text-xs text-app-text-muted">{deposit.month} deposit</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-app-text">৳{deposit.amount.toLocaleString()}</p>
                  <StatusBadge label={deposit.status} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <h2 className="text-lg font-semibold text-app-text">Loan attention</h2>
          <p className="mt-1 text-sm text-app-text-muted">Items that may need follow-up</p>
          <div className="mt-5 space-y-4">
            {adminLoans.map((loan) => (
              <div key={loan.member} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-app-text">{loan.member}</p>
                  <p className="text-xs text-app-text-muted">Due {loan.due}</p>
                </div>
                <StatusBadge label={loan.status} />
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-app-border pt-4 text-sm text-app-text-muted">
            {adminMembers.length} member records are currently available.
          </div>
        </article>
      </section>
    </div>
  );
}
