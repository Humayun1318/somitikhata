import { AppShell } from '@/components/shared/app-shell';
import { StatCard } from '@/components/shared/stat-card';
import { memberAssetShare, memberDepositHistory, memberLoanSummary, memberMetrics } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/currency';

export default function MemberDashboardPage() {
  return (
    <AppShell variant="member" title="Dashboard" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text)]">Logout</button>}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Total Savings" value={formatCurrency(memberMetrics.totalSavings)} meta="Updated today" />
        <StatCard title="This Month&apos;s Deposit" value={formatCurrency(memberMetrics.thisMonthDeposit)} meta="Recorded on 12 Sep 2026" />
        <StatCard title="Previous Balance" value={formatCurrency(memberMetrics.previousBalance)} meta="Before this month" />
        <StatCard title="Asset Share" value={formatCurrency(memberAssetShare.value)} meta="12.4% of land asset" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Savings growth</h2>
            <span className="text-sm text-[var(--color-text-muted)]">Last 6 months</span>
          </div>
          <div className="flex h-48 items-end gap-3">
            {[40, 58, 62, 76, 88, 100].map((height, index) => (
              <div key={height} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-[linear-gradient(180deg,#0f6b4f_0%,#88b8a1_100%)]" style={{ height: `${height}%` }} />
                <span className="text-xs text-[var(--color-text-muted)]">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Loan status</h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-[rgba(15,107,79,0.08)] p-3">
              <div className="text-sm text-[var(--color-text-muted)]">Active loan</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-text)]">{formatCurrency(memberLoanSummary.remaining)}</div>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
              <div className="text-sm text-[var(--color-text-muted)]">Next installment</div>
              <div className="mt-1 text-lg font-semibold text-[var(--color-text)]">{formatCurrency(memberLoanSummary.nextInstallment)}</div>
              <div className="mt-1 text-xs text-[var(--color-text-muted)]">Due 15 Sep 2026</div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Deposit history</h2>
          <button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">View all</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Running total</th>
              </tr>
            </thead>
            <tbody>
              {memberDepositHistory.map((row) => (
                <tr key={row.month} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 text-[var(--color-text)]">{row.month}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
