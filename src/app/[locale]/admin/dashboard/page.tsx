import { AppShell } from '@/components/shared/app-shell';
import { StatCard } from '@/components/shared/stat-card';
import { adminDeposits, adminLoans, adminMembers, adminStats } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/status-badge';

export default function AdminDashboardPage() {
  return (
    <AppShell variant="admin" title="Dashboard" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">New report</button>}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.en.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} meta={stat.meta} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Recent deposits</h2>
            <button className="text-sm font-medium text-[var(--color-primary)]">View all</button>
          </div>
          <div className="space-y-3">
            {adminDeposits.map((deposit) => (
              <div key={deposit.member} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                <div>
                  <div className="font-medium text-[var(--color-text)]">{deposit.member}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{deposit.month}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[var(--color-text)]">৳{deposit.amount.toLocaleString()}</div>
                  <StatusBadge label={deposit.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Pending loans</h2>
            <button className="text-sm font-medium text-[var(--color-primary)]">Review</button>
          </div>
          <div className="space-y-3">
            {adminLoans.map((loan) => (
              <div key={loan.member} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--color-text)]">{loan.member}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">Due {loan.due}</div>
                  </div>
                  <StatusBadge label={loan.status} />
                </div>
                <div className="mt-3 text-sm font-semibold text-[var(--color-text)]">Principal: ৳{loan.principal.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Member overview</h2>
          <button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text)]">Manage members</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Savings</th>
              </tr>
            </thead>
            <tbody>
              {adminMembers.map((member) => (
                <tr key={member.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--color-text)]">{member.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{member.id}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{member.phone}</td>
                  <td className="px-4 py-3"><StatusBadge label={member.status} /></td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-text)]">৳{member.totalSavings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
